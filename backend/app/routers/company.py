from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Company, User, ApproverAssignment, ApprovalRule
from ..schemas import CompanyCreate, CompanyResponse, ApproverAssignmentsUpdate, ApprovalRuleUpdate
from ..deps import get_current_user, require_admin

router = APIRouter(prefix="/company", tags=["company"])


@router.post("/create", response_model=CompanyResponse)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only allow if user has no company yet or is admin
    if current_user.company_id:
        raise HTTPException(status_code=400, detail="Company already assigned")

    company = Company(name=payload.name, country=payload.country, currency=payload.currency or current_user.currency)
    db.add(company)
    db.commit()
    db.refresh(company)

    # Link current user as admin to company
    current_user.company_id = company.id
    current_user.role = "admin"
    db.add(current_user)
    db.commit()

    return company


@router.put("/approvers", response_model=list[dict])
def update_approver_assignments(
    payload: ApproverAssignmentsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    # Replace all assignments for admin's company
    # Fetch admin company
    admin_company_id = db.query(User.company_id).filter(User.role == "admin").first()
    if not admin_company_id or not admin_company_id[0]:
        raise HTTPException(status_code=400, detail="Admin company not found")
    company_id = admin_company_id[0]

    # Delete existing
    db.query(ApproverAssignment).filter(ApproverAssignment.company_id == company_id).delete()
    db.commit()

    created = []
    for item in payload.assignments:
        assignment = ApproverAssignment(company_id=company_id, approver_id=item.approver_id, step_order=item.step_order)
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        created.append({"id": assignment.id, "approver_id": assignment.approver_id, "step_order": assignment.step_order})

    return created


@router.put("/approval-rule")
def update_approval_rule(
    payload: ApprovalRuleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    # Upsert approval rule per company
    company_id = current_admin.company_id
    rule = db.query(ApprovalRule).filter(ApprovalRule.company_id == company_id).first()
    if not rule:
        rule = ApprovalRule(company_id=company_id)
        db.add(rule)
        db.commit()
        db.refresh(rule)

    if payload.percentage_threshold is not None:
        rule.percentage_threshold = payload.percentage_threshold
    if payload.specific_approver_id is not None:
        rule.specific_approver_id = payload.specific_approver_id
    rule.hybrid = payload.hybrid if payload.hybrid is not None else rule.hybrid
    db.add(rule)
    db.commit()
    return {"status": "ok"}