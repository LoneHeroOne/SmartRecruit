from pydantic import BaseModel, EmailStr, validator
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

# ---------- Job ----------
class JobBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    duration: Optional[str] = None
    requirements: Optional[List[str]] = None
    deadline: Optional[date] = None
    contract_type: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class JobRead(JobBase):
    id: int

    @validator('requirements', pre=True, always=True)
    def parse_requirements(cls, v):
        if isinstance(v, str):
            # Convert PostgreSQL array string like '{item1,item2}' to list
            if v.startswith('{') and v.endswith('}'):
                return v[1:-1].split(',') if v != '{}' else []
            else:
                # If it's not PostgreSQL format, assume it's JSON string or comma-separated
                try:
                    import json
                    return json.loads(v)
                except:
                    return v.split(',') if v else []
        return v

# ---------- CV ----------
class CVRead(BaseModel):
    id: int
    file_path: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

# ---------- Application ----------
class ApplicationCreate(BaseModel):
    job_id: int
    full_name: str
    phone_number: str
    education_level: str
    years_experience: int
    linkedin_url: Optional[str] = None
    cover_letter: str

class ApplicationRead(BaseModel):
    id: int
    score: Optional[float]
    applied_at: datetime
    status: Optional[str] = 'submitted'
    # Include new fields for reading (admin view)
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    education_level: Optional[str] = None
    years_experience: Optional[int] = None
    linkedin_url: Optional[str] = None
    cover_letter: Optional[str] = None
    class Config:
        from_attributes = True

class ApplicationAdminRead(BaseModel):
    id: int
    score: Optional[float]
    applied_at: datetime
    status: Optional[str] = 'submitted'
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    education_level: Optional[str] = None
    years_experience: Optional[int] = None
    linkedin_url: Optional[str] = None
    cover_letter: Optional[str] = None
    job_title: Optional[str] = None
    user_email: Optional[str] = None
    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: str
