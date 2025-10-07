from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.deps import require_admin
from app.crud import (
    list_internships,
    get_internship,
    create_internship,
    update_internship,
    delete_internship,
)

router = APIRouter()

# Public reads
@router.get("/", response_model=list[schemas.InternshipRead])
def read_internships(db: Session = Depends(get_db)):
    return list_internships(db)

@router.get("/{internship_id}", response_model=schemas.InternshipRead)
def read_internship(internship_id: int, db: Session = Depends(get_db)):
    obj = get_internship(db, internship_id=internship_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Internship not found")
    return obj

# Admin-only writes
@router.post("/", response_model=schemas.InternshipRead)
def create_internship_route(
    payload: schemas.InternshipCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),  # ✅ admin required
):
    return create_internship(
        db,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        duration=payload.duration,
        requirements=payload.requirements,
        deadline=payload.deadline,
    )

@router.put("/{internship_id}", response_model=schemas.InternshipRead)
def update_internship_route(
    internship_id: int,
    payload: schemas.InternshipUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),  # ✅ admin required
):
    obj = get_internship(db, internship_id=internship_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Internship not found")
    return update_internship(
        db,
        internship=obj,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        duration=payload.duration,
        requirements=payload.requirements,
        deadline=payload.deadline,
    )

@router.delete("/{internship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_internship_route(
    internship_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),  # ✅ admin required
):
    obj = get_internship(db, internship_id=internship_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Internship not found")
    delete_internship(db, internship=obj)
    return
