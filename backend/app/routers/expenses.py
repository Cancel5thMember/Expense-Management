from datetime import datetime
from typing import List

import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Expense, Approval, ApproverAssignment, ApprovalRule
from ..schemas import ExpenseCreate, ExpenseResponse, ApprovalDecision
from ..deps import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])


def get_rate(base: str, target: str) -> float:
    if base == target:
        return 1.0
    try:
        r = requests.get(f"https://api.exchangerate-api.com/v4/latest/{base}", timeout=10)
        r.raise_for_status()
        data = r.json()
        rates = data.get("rates", {})
        return float(rates.get(target, 1.0))
    except Exception:
        return 1.0


def bootstrap_approvals_for_expense(db: Session, employee: User, expense: Expense):
    # Build sequence: optional manager first if is_manager_approver, then company approver assignments
    step = 1
    if employee.manager_id and employee.is_manager_approver:
        db.add(Approval(expense_id=expense.id, approver_id=employee.manager_id, step_order=step, status="pending"))
        step += 1
    # Company assignments in order
    assignments: List[ApproverAssignment] = (
        db.query(ApproverAssignment)
        .filter(ApproverAssignment.company_id == employee.company_id)
        .order_by(ApproverAssignment.step_order.asc())
        .all()
    )
    for a in assignments:
        status_val = "pending" if step == 1 and not (employee.manager_id and employee.is_manager_approver) else "queued"
        db.add(Approval(expense_id=expense.id, approver_id=a.approver_id, step_order=step, status=status_val))
        step += 1


@router.post("/", response_model=ExpenseResponse)
def submit_expense(payload: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.company_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not linked to a company")

    # Normalize to company currency
    company_currency = current_user.currency if current_user.currency else "USD"
    rate = get_rate(payload.currency, company_currency)
    normalized_amount = payload.amount * rate

    expense = Expense(
        employee_id=current_user.id,
        company_id=current_user.company_id,
        amount=payload.amount,
        currency=payload.currency,
        normalized_amount=normalized_amount,
        category=payload.category,
        description=payload.description,
        date=datetime.fromisoformat(payload.date) if payload.date else datetime.utcnow(),
        status="pending",
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)

    # Create approvals chain
    bootstrap_approvals_for_expense(db, current_user, expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("/me", response_model=List[ExpenseResponse])
def my_expenses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Expense).filter(Expense.employee_id == current_user.id).order_by(Expense.created_at.desc()).all()
    return items


@router.get("/approvals/pending")
def pending_approvals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Approval).filter(Approval.approver_id == current_user.id, Approval.status == "pending").order_by(Approval.step_order.asc()).all()
    return [
        {
            "id": a.id,
            "expense_id": a.expense_id,
            "step_order": a.step_order,
            "status": a.status,
        }
        for a in items
    ]


def evaluate_rules_and_progress(db: Session, expense: Expense) -> None:
    # Fetch approvals
    approvals: List[Approval] = db.query(Approval).filter(Approval.expense_id == expense.id).order_by(Approval.step_order.asc()).all()
    approved_count = sum(1 for a in approvals if a.status == "approved")
    total_count = len(approvals)

    # Fetch rule for company
    rule = db.query(ApprovalRule).filter(ApprovalRule.company_id == expense.company_id).first()
    specific_approved = False
    if rule and rule.specific_approver_id:
        specific_approved = any(a.approver_id == rule.specific_approver_id and a.status == "approved" for a in approvals)

    # If any rejection -> reject immediately
    if any(a.status == "rejected" for a in approvals):
        expense.status = "rejected"
        db.add(expense)
        return

    # Determine approval based on rules
    percentage_ok = False
    if rule and rule.percentage_threshold is not None:
        percentage_ok = (approved_count / max(total_count, 1)) * 100 >= rule.percentage_threshold
    else:
        # Default: require all approvals
        percentage_ok = approved_count == total_count and total_count > 0

    if rule and rule.hybrid:
        approved = percentage_ok or specific_approved
    else:
        approved = specific_approved or percentage_ok

    if approved:
        expense.status = "approved"
        db.add(expense)
        return

    # Otherwise, advance next queued to pending
    for a in approvals:
        if a.status == "queued":
            a.status = "pending"
            db.add(a)
            break


@router.post("/approvals/{expense_id}/decide")
def decide(expense_id: int, payload: ApprovalDecision, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    approval = (
        db.query(Approval)
        .filter(Approval.expense_id == expense_id, Approval.approver_id == current_user.id, Approval.status == "pending")
        .first()
    )
    if not approval:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No pending approval for user")

    approval.status = "approved" if payload.approve else "rejected"
    approval.comment = payload.comment
    approval.decided_at = datetime.utcnow()
    db.add(approval)
    db.commit()

    # Evaluate flow
    evaluate_rules_and_progress(db, expense)
    db.commit()
    return {"status": "ok"}