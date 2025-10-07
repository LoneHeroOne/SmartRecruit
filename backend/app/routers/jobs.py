from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.deps import require_admin
from app.crud import (
    list_jobs,
    get_job,
    create_job,
    update_job,
    delete_job,
)

router = APIRouter()

# Public reads
@router.get("/", response_model=list[schemas.JobRead])
def read_jobs(db: Session = Depends(get_db)):
    return list_jobs(db)

@router.get("/{job_id}", response_model=schemas.JobRead)
def read_job(job_id: int, db: Session = Depends(get_db)):
    obj = get_job(db, job_id=job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    return obj

# Admin-only writes
@router.post("/", response_model=schemas.JobRead)
def create_job_route(
    payload: schemas.JobCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),  # ✅ admin required
):
    return create_job(
        db,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        duration=payload.duration,
        requirements=payload.requirements,
        deadline=payload.deadline,
        contract_type=payload.contract_type,
    )

@router.put("/{job_id}", response_model=schemas.JobRead)
def update_job_route(
    job_id: int,
    payload: schemas.JobUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),  # ✅ admin required
):
    obj = get_job(db, job_id=job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    return update_job(
        db,
        job=obj,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        duration=payload.duration,
        requirements=payload.requirements,
        deadline=payload.deadline,
        contract_type=payload.contract_type,
    )

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_route(
    job_id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),  # ✅ admin required
):
    obj = get_job(db, job_id=job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    delete_job(db, job=obj)
    return
