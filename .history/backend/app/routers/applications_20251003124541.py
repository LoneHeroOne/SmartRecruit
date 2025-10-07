# app/routers/applications.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models
from app.crud import get_cv, get_job, create_application
from app.utils import nlp

router = APIRouter()

class ApplyRequestBody(nlp.BaseModelLike):
    job_ids: List[int]
    cv_id: int

@router.post("/apply")
def apply_to_jobs(
    body: ApplyRequestBody,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cv = get_cv(db, cv_id=body.cv_id)
    if not cv or cv.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="CV not found")

    try:
        cv_text = nlp.extract_text(cv.file_path)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read CV file")

    results = []
    for iid in body.job_ids:
        it = get_job(db, job_id=iid)
        if not it:
            results.append({"job_id": iid, "error": "Job not found"})
            continue

        job_text = "\n".join(filter(None, [
            it.title,
            it.description,
            f"Location: {it.location}" if it.location else None,
            f"Duration: {it.duration}" if it.duration else None,
            "Requirements: " + ", ".join(it.requirements) if it.requirements else None,
            # no need to include deadline in scoring
        ]))
        score = nlp.compute_similarity(cv_text, job_text)  # 0..1
        app_row = create_application(
            db, user_id=current_user.id, job_id=it.id, score=float(score)
        )
        results.append({
            "application_id": app_row.id,
            "job_id": it.id,
            "score": score,
            "applied_at": app_row.applied_at,
        })

    return {"results": results}
