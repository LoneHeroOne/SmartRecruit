# app/routers/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import schemas, models
from app.crud import list_user_applications

router = APIRouter()

@router.get("/me", response_model=schemas.UserRead)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/me/applications")
def my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    apps = list_user_applications(db, user_id=current_user.id)
    # Minimal response; adapt to a Pydantic schema later if you like
    return [
        {
            "id": a.id,
            "score": a.score,
            "applied_at": a.applied_at,
            "internship_id": a.internship_id,
        }
        for a in apps
    ]
