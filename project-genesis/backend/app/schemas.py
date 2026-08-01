from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- AUTH SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    interests: List[str] = []
    daily_hours_goal: float = 4.0

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    interests: List[str] = []
    daily_hours_goal: float
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    interests: Optional[List[str]] = None
    daily_hours_goal: Optional[float] = None
    password: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# --- TASK SCHEMAS ---
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "General"
    priority: Optional[str] = "Medium"  # Low, Medium, High
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    category: str
    priority: str
    due_date: Optional[datetime] = None
    completed: bool
    predicted_due_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- NOTE SCHEMAS ---
class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    tags: List[str] = []
    image_url: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

class NoteResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: Optional[str] = None
    tags: List[str] = []
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- CALENDAR SCHEMAS ---
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class EventResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_ai_scheduled: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- HABIT SCHEMAS ---
class HabitCreate(BaseModel):
    name: str
    category: str  # Water, Exercise, Sleep, Reading, Coding, Meditation
    target_frequency: int = 1

class HabitResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    target_frequency: int
    completions: List[str] = []
    streak: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- FINANCE SCHEMAS ---
class ExpenseCreate(BaseModel):
    amount: float
    type: str  # income, expense
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = None

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    type: str
    category: str
    description: Optional[str] = None
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# --- STUDY PLAN SCHEMAS ---
class StudyPlanCreate(BaseModel):
    subjects: List[str]
    exam_date: datetime
    available_hours: float

class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    subjects: List[str]
    exam_date: datetime
    available_hours: float
    schedule: Dict[str, Any]
    revision_plan: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


# --- MOOD SCHEMAS ---
class MoodJournalCreate(BaseModel):
    entry: str

class MoodJournalResponse(BaseModel):
    id: int
    user_id: int
    entry: str
    sentiment: str
    emotions: List[str]
    mood_score: int
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# --- DOCUMENT SCHEMAS ---
class FileResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    file_path: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True

class RagQueryRequest(BaseModel):
    file_id: Optional[int] = None
    query: str
    mode: Optional[str] = "standard"  # standard, flashcards, quiz, beginner


# --- OTHER RESPONSE SCHEMAS ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    resource_type: str
    url: Optional[str] = None
    reasoning: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
