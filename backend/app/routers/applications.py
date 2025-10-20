from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
# import relative
from ..deps import get_db, get_current_user
from .. import models, schemas
from datetime import datetime, timezone
from ..services.email_service import send_email, tpl_submission, tpl_decision

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("", response_model=schemas.ApplicationOut)
def create_application(payload: schemas.ApplicationCreate,
                       background: BackgroundTasks,
                       db: Session = Depends(get_db),
                       user=Depends(get_current_user)):
    # Only candidates apply (admins optional)
    if not (getattr(user, "account_type", None) == "candidate" or getattr(user, "is_admin", False)):
        raise HTTPException(403, "Only candidates can apply")

    job = db.query(models.Job).get(payload.job_id)
    if not job or job.status != "published":
        raise HTTPException(404, "Job not found or not open")

    # Require a CV to exist (simple policy)
    if payload.cv_id is None:
        raise HTTPException(400, "Please provide cv_id")

    app = models.Application(
        user_id=user.id,
        job_id=payload.job_id,
        cover_letter=payload.cover_letter,
        cv_id=payload.cv_id,
        status="pending",
        applied_at=datetime.now(timezone.utc)
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # send submission email (background)
    try:
        subj, html, txt = tpl_submission(user.email, job.title)
        background.add_task(send_email, user.email, subj, html, txt)
    except Exception as e:
        print("[EMAIL][submission] enqueue failed:", e)

    return app

@router.get("/me", response_model=list[schemas.MyApplicationRead])
def my_applications(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = (
        db.query(
            models.Application.id,
            models.Application.job_id,
            models.Application.status,
            models.Application.score,
            models.Application.applied_at,
            models.Job.title.label("job_title"),
        )
        .join(models.Job, models.Job.id == models.Application.job_id)
        .filter(models.Application.user_id == user.id)
        .order_by(models.Application.applied_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "job_id": r.job_id,
            "job_title": r.job_title,
            "status": r.status,
            "score": r.score,
            "applied_at": r.applied_at,
        }
        for r in rows
    ]

@router.patch("/{application_id}/status")
def update_application_status(application_id: int, payload: dict,
                              background: BackgroundTasks,
                              db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Body: { "status": "accepted" | "rejected" }
    Only job owner or admin can change status. Sends decision email.
    """
    new_status = (payload or {}).get("status")
    if new_status not in {"accepted", "rejected"}:
        raise HTTPException(400, "Invalid status")

    app = db.query(models.Application).get(application_id)
    if not app:
        raise HTTPException(404, "Application not found")

    job = db.query(models.Job).get(app.job_id)
    if not job:
        raise HTTPException(404, "Job not found")

    if not (getattr(user, "is_admin", False) or job.owner_user_id == user.id):
        raise HTTPException(403, "Not allowed")

    app.status = new_status
    db.commit()
    db.refresh(app)

    # email candidate (background)
    try:
        candidate = db.query(models.User).get(app.user_id)
        if candidate and candidate.email:
            subj, html, txt = tpl_decision(candidate.email, job.title, new_status)
            background.add_task(send_email, candidate.email, subj, html, txt)
    except Exception as e:
        print("[EMAIL][decision] enqueue failed:", e)

    return {"id": app.id, "status": app.status}
