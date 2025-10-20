from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import os
import shutil
from typing import Optional
import uuid

from ..database import get_db
from ..models import User
from ..schemas import CompanyMe, CompanyUpdateIn, LogoUploadOut
from ..deps import get_current_user

router = APIRouter(prefix="/company", tags=["company"])

UPLOAD_DIR = "uploads/company_logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/me", response_model=CompanyMe)
def get_company_profile(current_user: User = Depends(get_current_user)) -> CompanyMe:
    if current_user.account_type != "company":
        raise HTTPException(status_code=403, detail="Only company accounts can access this endpoint")
    return CompanyMe(
        company_name=current_user.company_name,
        company_logo_url=current_user.company_logo_url,
        company_description=current_user.company_description,
        sector=current_user.sector
    )

@router.patch("/me", response_model=CompanyMe)
def update_company_profile(
    update_data: CompanyUpdateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> CompanyMe:
    if current_user.account_type != "company":
        raise HTTPException(status_code=403, detail="Only company accounts can access this endpoint")

    # Update fields
    if update_data.company_name is not None:
        current_user.company_name = update_data.company_name
    if update_data.company_description is not None:
        current_user.company_description = update_data.company_description
    if update_data.sector is not None:
        current_user.sector = update_data.sector

    db.commit()
    db.refresh(current_user)
    return CompanyMe(
        company_name=current_user.company_name,
        company_logo_url=current_user.company_logo_url,
        company_description=current_user.company_description,
        sector=current_user.sector
    )

@router.post("/logo", response_model=LogoUploadOut)
def upload_company_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> LogoUploadOut:
    if current_user.account_type != "company":
        raise HTTPException(status_code=403, detail="Only company accounts can access this endpoint")

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are allowed")

    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update user logo URL
    logo_url = f"/static/company_logos/{unique_filename}"
    current_user.company_logo_url = logo_url
    db.commit()

    return LogoUploadOut(company_logo_url=logo_url)
