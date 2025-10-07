from pydantic import BaseModel, EmailStr
from datetime import datetime
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
        orm_mode = True

# ---------- Internship ----------
class InternshipBase(BaseModel):
    title: str
    description: str
    company: str

class InternshipCreate(InternshipBase):
    pass

class InternshipRead(InternshipBase):
    id: int
    class Config:
        orm_mode = True

# ---------- CV ----------
class CVRead(BaseModel):
    id: int
    file_path: str
    uploaded_at: datetime
    class Config:
        orm_mode = True

# ---------- Application ----------
class ApplicationRead(BaseModel):
    id: int
    score: Optional[float]
    applied_at: datetime
    class Config:
        orm_mode = True
