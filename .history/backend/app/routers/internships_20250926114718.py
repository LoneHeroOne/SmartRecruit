# app/routers/internships.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.deps import get_current_user
from app.crud import (
    list_internships,
    get_internship,
    create_internship,
    update_internship,
    delete_internship,
)

router = APIRouter()

@router.get("/", response_model=list[schemas.InternshipRead])
def read_internships(db: Session = Depends(get_db)):
    return list_internships(db)

@router.get("/{internship_id}", response_model=schemas.InternshipRead)
def read_internship(internship_id: int, db: Session = Depends(get_db)):
    obj = get_internship(db, internship_id=internship_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Internship not found")
    return obj

@router.post("/", response_model=schemas.InternshipRead)
def create_internship_route(
    payload: schemas.InternshipCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),  # require login
):
    return create_internship(db, title=payload.title, description=payload.description, company=payload.company)

@router.put("/{internship_id}", response_model=schemas.InternshipRead)
def update_internship_route(
    internship_id: int,
    payload: schemas.InternshipCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),  # require login
):
    obj = get_internship(db, internship_id=internship_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Internship not found")
    return update_internship(db, internship=obj, title=payload.title, description=payload.description, company=payload.company)

@router.delete("/{internship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_internship_route(
    internship_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),  # require login
):
    obj = get_internship(db, internship_id=internship_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Internship not found")
    delete_internship(db, internship=obj)
    return
