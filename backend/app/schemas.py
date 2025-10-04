from pydantic import BaseModel, EmailStr
from typing import Optional, List


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    country: str
    currency: str
    company_id: Optional[int] = None
    manager_id: Optional[int] = None
    is_manager_approver: Optional[bool] = False


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "employee"
    country: str = "United States"
    currency: str = "USD"
    manager_id: Optional[int] = None
    is_manager_approver: Optional[bool] = False


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    country: str
    currency: str
    company_id: Optional[int] = None
    manager_id: Optional[int] = None
    is_manager_approver: bool = False

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Company Schemas
class CompanyCreate(BaseModel):
    name: str
    country: str
    currency: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    country: str
    currency: str

    class Config:
        from_attributes = True


class ApproverAssignmentItem(BaseModel):
    approver_id: int
    step_order: int


class ApproverAssignmentsUpdate(BaseModel):
    assignments: List[ApproverAssignmentItem]


class ApprovalRuleUpdate(BaseModel):
    percentage_threshold: Optional[int] = None
    specific_approver_id: Optional[int] = None
    hybrid: bool = False


# Expense Schemas
class ExpenseCreate(BaseModel):
    amount: float
    currency: str
    category: str
    description: str
    date: Optional[str] = None


class ApprovalStep(BaseModel):
    approver_id: int
    step_order: int
    status: str
    comment: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    employee_id: int
    company_id: int
    amount: float
    currency: str
    normalized_amount: float
    category: str
    description: str
    date: str
    status: str

    class Config:
        from_attributes = True


class ApprovalAction(BaseModel):
    comment: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    new_password: str


class ApprovalDecision(BaseModel):
    approve: bool
    comment: Optional[str] = None