from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional, List

# ---------- User ----------
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    class Config:
        from_attributes = True

# ---------- Internship ----------
class InternshipBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    duration: Optional[str] = None
    requirements: Optional[List[str]] = None
    deadline: Optional[str] = None  # Adjust type if needed, e.g., datetime.date

class InternshipCreate(InternshipBase):
    pass

class InternshipRead(InternshipBase):
    id: int
    class Config:
        from_attributes = True

# ---------- CV ----------
class CVRead(BaseModel):
    id: int
    file_path: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

# ---------- Application ----------
class ApplicationRead(BaseModel):
    id: int
    score: Optional[float]
    applied_at: datetime
    class Config:
        from_attributes = True
