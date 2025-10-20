from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("", response_model=List[schemas.JobOut])
def list_jobs(status: Optional[str] = "published", db: Session = Depends(get_db)):
    jobs = db.query(models.Job).filter(models.Job.status == status).order_by(models.Job.posted_at.desc()).all()
    # Convert to list of dicts to handle JSONB serialization
    result = []
    for job in jobs:
        job_dict = {
            'id': job.id,
            'title': job.title,
            'company_name': job.company_name,
            'company_logo_url': job.company_logo_url,
            'location_city': job.location_city,
            'location_country': job.location_country,
            'experience_min': job.experience_min,
            'employment_type': job.employment_type,
            'work_mode': job.work_mode,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'salary_currency': job.salary_currency,
            'salary_is_confidential': job.salary_is_confidential,
            'education_level': job.education_level,
            'company_overview': job.company_overview,
            'offer_description': job.offer_description,
            'missions': job.missions if isinstance(job.missions, list) else [],
            'profile_requirements': job.profile_requirements,
            'skills': job.skills if isinstance(job.skills, list) else [],
            'description': job.description,
            'deadline': job.deadline,
            'status': job.status,
            'posted_at': job.posted_at,
            'updated_at': job.updated_at,
            'created_at': job.created_at,
            'owner_user_id': job.owner_user_id,
        }
        result.append(job_dict)
    return result

@router.get("/{job_id}", response_model=schemas.JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    # Convert to dict to handle JSONB serialization
    job_dict = {
        'id': job.id,
        'title': job.title,
        'company_name': job.company_name,
        'company_logo_url': job.company_logo_url,
        'location_city': job.location_city,
        'location_country': job.location_country,
        'experience_min': job.experience_min,
        'employment_type': job.employment_type,
        'work_mode': job.work_mode,
        'salary_min': job.salary_min,
        'salary_max': job.salary_max,
        'salary_currency': job.salary_currency,
        'salary_is_confidential': job.salary_is_confidential,
        'education_level': job.education_level,
        'company_overview': job.company_overview,
        'offer_description': job.offer_description,
        'missions': job.missions if isinstance(job.missions, list) else [],
        'profile_requirements': job.profile_requirements,
        'skills': job.skills if isinstance(job.skills, list) else [],
        'description': job.description,
        'deadline': job.deadline,
        'status': job.status,
        'posted_at': job.posted_at,
        'updated_at': job.updated_at,
        'created_at': job.created_at,
        'owner_user_id': job.owner_user_id,
    }
    return job_dict

@router.post("", response_model=schemas.JobOut)
def create_job(payload: schemas.JobCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    from datetime import datetime
    # only company or admin
    if not (user.is_admin or getattr(user, "account_type", None) == "company"):
        raise HTTPException(403, "Not allowed")
    job_data = payload.model_dump()
    # Default company_name from user if not provided
    if not job_data.get("company_name") and user.company_name:
        job_data["company_name"] = user.company_name
    # Ensure missions and skills are properly serialized for PostgreSQL JSONB
    job = models.Job(**job_data)
    job.owner_user_id = user.id
    # Set timestamps manually since model server_defaults are being ignored
    now = datetime.utcnow()
    job.posted_at = now
    job.updated_at = now
    job.created_at = now
    db.add(job)
    db.commit()
    db.refresh(job)
    # Convert back to dict and then to JobOut to handle JSONB serialization
    job_dict = {
        'id': job.id,
        'title': job.title,
        'company_name': job.company_name,
        'company_logo_url': job.company_logo_url,
        'location_city': job.location_city,
        'location_country': job.location_country,
        'experience_min': job.experience_min,
        'employment_type': job.employment_type,
        'work_mode': job.work_mode,
        'salary_min': job.salary_min,
        'salary_max': job.salary_max,
        'salary_currency': job.salary_currency,
        'salary_is_confidential': job.salary_is_confidential,
        'education_level': job.education_level,
        'company_overview': job.company_overview,
        'offer_description': job.offer_description,
        'missions': job.missions if isinstance(job.missions, list) else [],
        'profile_requirements': job.profile_requirements,
        'skills': job.skills if isinstance(job.skills, list) else [],
        'description': job.description,
        'deadline': job.deadline,
        'status': job.status,
        'posted_at': job.posted_at,
        'updated_at': job.updated_at,
        'created_at': job.created_at,
        'owner_user_id': job.owner_user_id,
    }
    return job_dict

@router.patch("/{job_id}", response_model=schemas.JobOut)
def update_job(job_id: int, payload: schemas.JobUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    job = db.query(models.Job).get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    # company owner or admin
    if not (user.is_admin or job.owner_user_id == user.id):
        raise HTTPException(403, "Not allowed")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(job, k, v)
    db.commit()
    db.refresh(job)
    # Return serialized dict to handle JSONB
    job_dict = {
        'id': job.id,
        'title': job.title,
        'company_name': job.company_name,
        'company_logo_url': job.company_logo_url,
        'location_city': job.location_city,
        'location_country': job.location_country,
        'experience_min': job.experience_min,
        'employment_type': job.employment_type,
        'work_mode': job.work_mode,
        'salary_min': job.salary_min,
        'salary_max': job.salary_max,
        'salary_currency': job.salary_currency,
        'salary_is_confidential': job.salary_is_confidential,
        'education_level': job.education_level,
        'company_overview': job.company_overview,
        'offer_description': job.offer_description,
        'missions': job.missions if isinstance(job.missions, list) else [],
        'profile_requirements': job.profile_requirements,
        'skills': job.skills if isinstance(job.skills, list) else [],
        'description': job.description,
        'deadline': job.deadline,
        'status': job.status,
        'posted_at': job.posted_at,
        'updated_at': job.updated_at,
        'created_at': job.created_at,
        'owner_user_id': job.owner_user_id,
    }
    return job_dict

@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    job = db.query(models.Job).get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    if not (user.is_admin or job.owner_user_id == user.id):
        raise HTTPException(403, "Not allowed")
    db.delete(job)
    db.commit()
