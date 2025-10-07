# app/routers/cvs.py
import os
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models, schemas
from app.crud import create_cv, list_user_cvs
from app.utils import nlp

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

@router.post("/upload", response_model=schemas.CVRead)
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Basic type guard
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only .pdf, .docx, or .txt files are allowed")

    filename = f"{uuid.uuid4()}_{file.filename}"
    abs_path = os.path.join(UPLOAD_DIR, filename)

    with open(abs_path, "wb") as f:
        f.write(await file.read())

    # Optional: extract text now to verify it’s parsable
    try:
        _ = nlp.extract_text(abs_path)
    except Exception:
        # Not fatal; you can still store the file
        pass

    obj = create_cv(db, owner_id=current_user.id, file_path=abs_path)
    return obj

@router.get("/mine", response_model=list[schemas.CVRead])
def my_cvs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return list_user_cvs(db, owner_id=current_user.id)
