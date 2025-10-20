# backend/app/routers/cvs.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from .. import models
import os, uuid, shutil
from datetime import datetime, timezone

router = APIRouter(prefix="/cvs", tags=["cvs"])
UPLOAD_DIR = os.getenv("CV_UPLOAD_DIR", "uploads/cv")

def _is_pdf(upload: UploadFile) -> bool:
    # 1) extension
    try:
        if upload.filename and upload.filename.lower().endswith(".pdf"):
            return True
    except Exception:
        pass
    # 2) content type
    if (upload.content_type or "").lower() == "application/pdf":
        return True
    # 3) magic header
    try:
        head = upload.file.read(5)
        upload.file.seek(0)
        return head == b"%PDF-"
    except Exception:
        return False

@router.post("", response_model=dict)
def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not _is_pdf(file):
        raise HTTPException(status_code=400, detail="Le CV doit être en PDF")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    fname = f"{user.id}_{uuid.uuid4().hex}.pdf"  # force .pdf extension
    dst = os.path.join(UPLOAD_DIR, fname)

    with open(dst, "wb") as out:
        shutil.copyfileobj(file.file, out)

    cv = models.CV(user_id=user.id, file_path=dst)
    cv.uploaded_at = datetime.now(tz=timezone.utc)  # ensure not None
    db.add(cv); db.commit(); db.refresh(cv)
    return {"id": cv.id, "file_path": cv.file_path, "uploaded_at": cv.uploaded_at.isoformat() if cv.uploaded_at else None}

@router.get("", response_model=list[dict])
def list_my_cvs(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = (
        db.query(models.CV)
        .filter(models.CV.user_id == user.id)
        .order_by(models.CV.uploaded_at.desc())
        .all()
    )
    return [{"id": r.id, "file_path": r.file_path, "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None} for r in rows]

@router.get("/current", response_model=dict | None)
def get_current_cv(db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = (
        db.query(models.CV)
        .filter(models.CV.user_id == user.id)
        .order_by(models.CV.uploaded_at.desc())
        .first()
    )
    if not row:
        return None
    return {"id": row.id, "file_path": row.file_path, "uploaded_at": row.uploaded_at.isoformat() if row.uploaded_at else None}
