# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.deps import get_current_user, require_admin
from app import models, schemas
from app.crud import get_job, create_application, list_all_applications, get_application, update_application_status
from app.Services.email_service import send_status_email

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

    # Combine first_name and last_name into full_name for storage
    full_name = f"{body.first_name} {body.last_name}".strip()

    # Create application without any matching logic
    try:
        app_row = create_application(
            db=db,
            user_id=current_user.id,
            job_id=body.job_id,
            full_name=full_name,
            phone_number=body.phone_number,
            education_level=body.education_level,
            years_experience=body.years_experience,
            linkedin_url=body.linkedin_url,
            cover_letter=body.cover_letter,
            score=None  # No auto-matching
        )
    except IntegrityError:
        # Handle unique constraint violation (user already applied for this job)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already applied for this job."
        )

    return {
        "message": "Application received and under review",
        "application_id": app_row.id,
        "status": "submitted"
    }

@router.get("/", response_model=list[schemas.ApplicationAdminRead])
def list_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    apps = list_all_applications(db)
    result = []
    for app in apps:
        admin_read = schemas.ApplicationAdminRead(
            id=app.id,
            score=app.score,
            applied_at=app.applied_at,
            status=app.status,
            full_name=app.full_name,
            phone_number=app.phone_number,
            education_level=app.education_level,
            years_experience=app.years_experience,
            linkedin_url=app.linkedin_url,
            cover_letter=app.cover_letter,
            job_title=app.job.title if app.job else None,
            user_email=app.user.email if app.user else None,
        )
        result.append(admin_read)
    return result

@router.get("/test")
def test_endpoint():
    return {"message": "Applications router working"}

@router.get("/debug/{application_id}")
def debug_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Debug endpoint to check application existence and details"""
    print(f"Debugging application {application_id}")
    app = get_application(db, application_id=application_id)
    if not app:
        print("Application not found")
        return {"error": "Application not found"}

    result = {
        "id": app.id,
        "user_id": app.user_id,
        "job_id": app.job_id,
        "status": app.status,
        "has_user": app.user is not None,
        "user_email": app.user.email if app.user else None,
        "full_name": app.full_name
    }
    print(f"Debug result: {result}")
    return result

@router.patch("/{application_id}/status")
def update_application_status(
    application_id: int,
    body: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Synchronous version with email - FastAPI should handle async calls in sync endpoint via await"""
    print(f"Starting status update for application {application_id}")
    app = get_application(db, application_id=application_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    print(f"Found application, user email: {app.user.email if app.user else 'NO USER'}")

    updated_app = update_application_status(db, application=app, status=body.status)

    # Try sync call to async email function (should work in FastAPI)
    import asyncio
    try:
        if app.user and app.user.email:
            print(f"Sending email to {app.user.email} for status: {body.status}")

            # Use asyncio to run the async email function synchronously
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            loop.run_until_complete(send_status_email(
                recipient=app.user.email,
                status=body.status,
                full_name=app.full_name or "Candidate"
            ))
            loop.close()

            print("Email sent successfully")
        else:
            print("No user email found - skipping email")
    except Exception as e:
        # Log email error but don't fail the status update
        print(f"Failed to send email notification: {e}")
        import traceback
        traceback.print_exc()

    return {
        "message": "Application status updated successfully",
        "application": {
            "id": updated_app.id,
            "status": updated_app.status,
        }
    }

@router.patch("/{application_id}/simple-status")
def update_application_status_simple(
    application_id: int,
    body: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Simple synchronous version without email for testing"""
    print(f"Simple update for application {application_id}")
    app = get_application(db, application_id=application_id)
    if not app:
        print("Application not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    print(f"Found application: {app.full_name}, status: {app.status}")
    print(f"Updating status from {app.status} to {body.status}")

    updated_app = update_application_status(db, application=app, status=body.status)

    print("Status updated successfully")
    return {
        "message": "Status updated (no email)",
        "application": {
            "id": updated_app.id,
            "status": updated_app.status,
        }
    }
