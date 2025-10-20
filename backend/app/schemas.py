from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from typing import Literal

# Auth/Register
class RegisterIn(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    account_type: Optional[str] = None   # "candidate" | "company"
    company_name: Optional[str] = None
    sector: Optional[str] = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Auth/Login
class LoginIn(BaseModel):
    email: str
    password: str

# Users
class UserOut(BaseModel):
    id: int
    email: str
    is_admin: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    account_type: Optional[str] = None
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_description: Optional[str] = None
    sector: Optional[str] = None
    class Config: from_attributes = True

Status = Literal["draft", "published", "archived"]

# Jobs
class JobBase(BaseModel):
    title: str
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None

    # NEW: single string field
    experience_min: Optional[str] = None

    employment_type: Optional[str] = None
    work_mode: Optional[str] = None

    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    salary_is_confidential: bool = False

    education_level: Optional[str] = None

    company_overview: Optional[str] = None
    offer_description: Optional[str] = None
    missions: List[str] = Field(default_factory=list)
    profile_requirements: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    description: Optional[str] = None

    deadline: Optional[date] = None
    status: Status = "published"

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    # make everything optional in PATCH
    title: Optional[str] = None
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    location_city: Optional[str] = None
    location_country: Optional[str] = None
    experience_min: Optional[str] = None
    employment_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    salary_is_confidential: Optional[bool] = None
    education_level: Optional[str] = None
    company_overview: Optional[str] = None
    offer_description: Optional[str] = None
    missions: Optional[List[str]] = None
    profile_requirements: Optional[str] = None
    skills: Optional[List[str]] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[Status] = None

class JobOut(JobBase):
    id: int
    posted_at: datetime
    updated_at: datetime
    created_at: datetime
    owner_user_id: Optional[int] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Handle JSONB fields that come back as strings from PostgreSQL
        data = super().from_orm(obj)
        if isinstance(data.missions, str):
            import json
            data.missions = json.loads(data.missions)
        if isinstance(data.skills, str):
            import json
            data.skills = json.loads(data.skills)
        return data

from typing import Literal

# Applications
class ApplicationCreate(BaseModel):
    job_id: int
    cover_letter: Optional[str] = None
    cv_id: Optional[int] = None

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    cover_letter: Optional[str] = None
    cv_id: Optional[int] = None
    status: Literal["pending", "under_review", "accepted", "rejected"]
    score: Optional[float] = None
    applied_at: datetime
    class Config:
        from_attributes = True

class MyApplicationRead(BaseModel):
    id: int
    job_id: int
    job_title: str
    status: str
    score: Optional[float] = None
    applied_at: datetime

# Company
class CompanyMe(BaseModel):
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_description: Optional[str] = None
    sector: Optional[str] = None

class CompanyUpdateIn(BaseModel):
    company_name: Optional[str] = None
    company_description: Optional[str] = None
    sector: Optional[str] = None

class LogoUploadOut(BaseModel):
    company_logo_url: str

# CV
class CVRead(BaseModel):
    id: int
    file_path: str
    uploaded_at: datetime
    class Config: from_attributes = True
