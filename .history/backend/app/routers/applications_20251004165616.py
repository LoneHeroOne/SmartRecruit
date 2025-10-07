# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models, schemas
from app.crud import get_job, create_application

router = APIRouter()

@router.post("/apply", response_model=None)
def apply_to_job(
    body: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    job = get_job(db, job_id=body.job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job not found")

    # Check for existing active application
    existing_app = db.query(models.Application).filter(
        models.Application.user_id == current_user.id,
        models.Application.job_id == body.job_id,
        models.Application.status.in_(['submitted', 'under_review'])
    ).first()
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already have an active application for this job"
        )

    # Create application without any matching logic
    app_row = create_application(
        db=db,
        user_id=current_user.id,
        job_id=body.job_id,
        full_name=body.full_name,
        phone_number=body.phone_number,
        education_level=body.education_level,
        years_experience=body.years_experience,
        linkedin_url=body.linkedin_url,
        cover_letter=body.cover_letter,
        score=None  # No auto-matching
    )

    return {
        "message": "Application received and under review",
        "application_id": app_row.id,
        "status": "submitted"
    }
