# app/crud.py
from typing import Iterable, Sequence, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date

from app import models

# ---------- Users ----------
def get_user_by_email(db: Session, *, email: str) -> models.User | None:
    return db.execute(
        select(models.User).where(models.User.email == email)
    ).scalar_one_or_none()

# ---------- Internships ----------
def list_internships(db: Session) -> Sequence[models.Internship]:
    return db.execute(select(models.Internship)).scalars().all()

def get_internship(db: Session, *, internship_id: int) -> Optional[models.Internship]:
    return db.get(models.Internship, internship_id)

def create_internship(
    db: Session,
    *,
    title: str,
    description: str,
    location: Optional[str],
    duration: Optional[str],
    requirements: Optional[List[str]],
    deadline: Optional[date],
) -> models.Internship:
    obj = models.Internship(
        title=title,
        description=description,
        location=location,
        duration=duration,
        requirements=requirements,
        deadline=deadline,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def update_internship(
    db: Session,
    *,
    internship: models.Internship,
    title: str,
    description: str,
    location: Optional[str],
    duration: Optional[str],
    requirements: Optional[List[str]],
    deadline: Optional[date],
) -> models.Internship:
    internship.title = title
    internship.description = description
    internship.location = location
    internship.duration = duration
    internship.requirements = requirements
    internship.deadline = deadline
    db.commit()
    db.refresh(internship)
    return internship

def delete_internship(db: Session, *, internship: models.Internship) -> None:
    db.delete(internship)
    db.commit()

# ---------- CVs ----------
def create_cv(db: Session, *, owner_id: int, file_path: str) -> models.CV:
    cv = models.CV(owner_id=owner_id, file_path=file_path)
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv

def list_user_cvs(db: Session, *, owner_id: int) -> Sequence[models.CV]:
    stmt = select(models.CV).where(models.CV.owner_id == owner_id).order_by(models.CV.uploaded_at.desc())
    return db.execute(stmt).scalars().all()

def get_cv(db: Session, *, cv_id: int) -> models.CV | None:
    return db.get(models.CV, cv_id)

# ---------- Applications ----------
def create_application(db: Session, *, user_id: int, internship_id: int, score: float | None) -> models.Application:
    app = models.Application(user_id=user_id, internship_id=internship_id, score=score)
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

def list_user_applications(db: Session, *, user_id: int) -> Sequence[models.Application]:
    stmt = select(models.Application).where(models.Application.user_id == user_id).order_by(models.Application.applied_at.desc())
    return db.execute(stmt).scalars().all()
