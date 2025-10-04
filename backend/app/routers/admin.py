from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Company, ApproverAssignment, ApprovalRule
from ..schemas import (
    UserCreate,
    UserResponse,
    CompanyCreate,
    CompanyResponse,
    ApproverAssignmentsUpdate,
    ApproverAssignmentItem,
    ApprovalRuleUpdate,
)
from ..auth import get_password_hash
from ..deps import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(User).all()


@router.post("/users", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Ensure email unique
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    # Link to admin's company
    company_id = admin.company_id
    if company_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin is not linked to a company")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        country=payload.country,
        currency=payload.currency,
        company_id=company_id,
        manager_id=payload.manager_id,
        is_manager_approver=payload.is_manager_approver or False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/company", response_model=CompanyResponse)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    company = Company(name=payload.name, country=payload.country, currency=payload.currency or payload.country)
    db.add(company)
    db.commit()
    db.refresh(company)
    # Link admin to company if not already linked
    if admin.company_id != company.id:
        admin.company_id = company.id
        db.add(admin)
        db.commit()
    return company


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = role
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/manager", response_model=UserResponse)
def update_user_manager(user_id: int, manager_id: int | None = None, is_manager_approver: bool | None = None, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.manager_id = manager_id
    if is_manager_approver is not None:
        user.is_manager_approver = is_manager_approver
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/approver-assignments", response_model=list[ApproverAssignmentItem])
def update_approver_assignments(payload: ApproverAssignmentsUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    # Delete existing assignments for company
    db.query(ApproverAssignment).filter(ApproverAssignment.company_id == admin.company_id).delete()
    # Insert new assignments
    for item in payload.assignments:
        db.add(ApproverAssignment(company_id=admin.company_id, approver_id=item.approver_id, step_order=item.step_order))
    db.commit()
    return payload.assignments


@router.get("/approver-assignments", response_model=list[ApproverAssignmentItem])
def list_approver_assignments(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    items = db.query(ApproverAssignment).filter(ApproverAssignment.company_id == admin.company_id).order_by(ApproverAssignment.step_order.asc()).all()
    return [ApproverAssignmentItem(approver_id=i.approver_id, step_order=i.step_order) for i in items]


@router.put("/approval-rule")
def update_approval_rule(payload: ApprovalRuleUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    rule = db.query(ApprovalRule).filter(ApprovalRule.company_id == admin.company_id).first()
    if not rule:
        rule = ApprovalRule(company_id=admin.company_id)
        db.add(rule)
    if payload.percentage_threshold is not None:
        rule.percentage_threshold = payload.percentage_threshold
    if payload.specific_approver_id is not None:
        rule.specific_approver_id = payload.specific_approver_id
    if payload.hybrid is not None:
        rule.hybrid = payload.hybrid
    db.commit()
    return {"status": "ok"}


@router.post("/users/{user_id}/reset-password")
def reset_password(user_id: int, new_password: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    db.commit()
    return {"status": "ok"}