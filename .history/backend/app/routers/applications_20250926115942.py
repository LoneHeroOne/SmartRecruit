# app/routers/applications.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models
from app.crud import get_cv, get_internship, create_application
from app.utils import nlp

router = APIRouter()

class ApplyRequestBody(nlp.BaseModelLike):  # tiny trick so we don't add a new Pydantic file
    internship_ids: List[int]
    cv_id: int

@router.post("/apply")
def apply_to_internships(
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
    for iid in body.internship_ids:
        it = get_internship(db, internship_id=iid)
        if not it:
            results.append({"internship_id": iid, "error": "Internship not found"})
            continue

        job_text = f"{it.title}\n{it.description}\n{it.company}"
        score = nlp.compute_similarity(cv_text, job_text)  # 0..1
        app_row = create_application(db, user_id=current_user.id, internship_id=it.id, score=float(score))
        results.append({
            "application_id": app_row.id,
            "internship_id": it.id,
            "score": score,
            "applied_at": app_row.applied_at,
        })

    return {"results": results}

# collect all targeted internships' texts
pairs = []
for it in internships:  # list of model rows
    pairs.append((it.id, f"{it.title}\n{it.description}\n{it.company}"))

ranked = nlp.rank_internships(cv_text, pairs, top_k=20)
# ranked is [(internship_id, score)] sorted desc