# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models
from app.crud import get_cv, get_job, create_application
from app.utils import nlp

router = APIRouter()

class ApplyRequestBody(nlp.BaseModelLike):
    job_id: int
    cv_id: int

@router.post("/apply")
def apply_to_job(
    body: ApplyRequestBody,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cv = get_cv(db, cv_id=body.cv_id)
    if not cv or cv.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")

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

    try:
        cv_text = nlp.extract_text(cv.file_path)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not read CV file")

    job_text = "\n".join(filter(None, [
        job.title,
        job.description,
        f"Location: {job.location}" if job.location else None,
        f"Duration: {job.duration}" if job.duration else None,
        "Requirements: " + ", ".join(job.requirements) if job.requirements else None,
        # no need to include deadline in scoring
    ]))
    score = nlp.compute_similarity(cv_text, job_text)  # 0..1
    app_row = create_application(
        db, user_id=current_user.id, job_id=job.id, score=float(score)
    )

    # Only include score/matching details for admin users
    if getattr(current_user, "is_admin", False):
        return {
            "application_id": app_row.id,
            "job_id": job.id,
            "score": score,
            "applied_at": app_row.applied_at,
        }
    else:
        return {
            "application_id": app_row.id,
            "status": "submitted",
            "applied_at": app_row.applied_at,
        }
