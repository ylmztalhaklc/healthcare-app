from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── USER ─────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str  # hasta_yakini | hasta_bakici

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# ─── TASK TEMPLATE ────────────────────────────────────────────

class TaskTemplateCreate(BaseModel):
    title: str
    description: Optional[str] = None
    default_time: Optional[str] = None
    task_type: str = "normal"

class TaskTemplateOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    default_time: Optional[str]
    task_type: str
    created_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── TASK INSTANCE ────────────────────────────────────────────

class TaskInstanceCreate(BaseModel):
    template_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    scheduled_for: datetime
    assigned_to_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    task_id: int
    user_id: int
    status: str
    problem_message: Optional[str] = None
    problem_severity: Optional[str] = None   # hafif | orta | ciddi
    resolution_note: Optional[str] = None

class TaskRating(BaseModel):
    task_id: int
    rating: float
    review_note: Optional[str] = None

class TaskInstanceOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    scheduled_for: datetime
    status: str
    problem_message: Optional[str]
    problem_severity: Optional[str]
    resolution_note: Optional[str]
    completion_photo_url: Optional[str]
    rating: Optional[float]
    review_note: Optional[str]
    created_by_id: int
    assigned_to_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── NOTIFICATION ─────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── MESSAGE ──────────────────────────────────────────────────

class MessageSend(BaseModel):
    sender_id: int
    receiver_id: int
    content: str

class MessageEdit(BaseModel):
    message_id: int
    new_content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    is_edited: bool
    is_deleted: bool
    sent_at: datetime

    class Config:
        from_attributes = True


# ─── STATISTICS ───────────────────────────────────────────────

class RelativeStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    active_tasks: int
    completion_rate: float
    problems_reported: int
    problems_resolved: int

class CaregiverStats(BaseModel):
    total_assigned: int
    completed_tasks: int
    completion_rate: float
    avg_rating: float
    tasks_today: int
