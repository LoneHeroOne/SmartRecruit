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

# ---------- Internship ----------
class InternshipBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    duration: Optional[str] = None
    requirements: Optional[List[str]] = None
    deadline: Optional[date] = None

class InternshipCreate(InternshipBase):
    pass

class InternshipUpdate(InternshipBase):
    pass

class InternshipRead(BaseModel):
    id: int
    title: str
    description: str
    location: Optional[str] = None
    duration: Optional[str] = None
    requirements: Optional[List[str]] = None
    deadline: Optional[date] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        # Handle requirements field conversion from PostgreSQL array string to list
        data = {}
        for field in cls.__fields__:
            value = getattr(obj, field, None)
            if field == 'requirements' and isinstance(value, str):
                # Convert PostgreSQL array string like '{item1,item2}' to list
                if value.startswith('{') and value.endswith('}'):
                    value = value[1:-1].split(',') if value != '{}' else []
                else:
                    # If it's not PostgreSQL format, assume it's JSON string or comma-separated
                    try:
                        import json
                        value = json.loads(value)
                    except:
                        value = value.split(',') if value else []
            data[field] = value
        return cls(**data)

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
