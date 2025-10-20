from sentence_transformers import SentenceTransformer, CrossEncoder, util
import numpy as np
import os
import hashlib
from typing import Dict, Optional

_AI_MODEL_NAME = os.getenv("BI_ENCODER_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
_CROSS_ENCODER_NAME = os.getenv("CROSS_ENCODER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
_bi_encoder: SentenceTransformer | None = None
_cross_encoder: CrossEncoder | None = None
_embeddings_cache: Dict[str, np.ndarray] = {}

def get_bi_encoder() -> SentenceTransformer:
    global _bi_encoder
    if _bi_encoder is None:
        _bi_encoder = SentenceTransformer(_AI_MODEL_NAME)
    return _bi_encoder

def get_cross_encoder() -> CrossEncoder:
    global _cross_encoder
    if _cross_encoder is None:
        _cross_encoder = CrossEncoder(_CROSS_ENCODER_NAME)
    return _cross_encoder

def compute_deterministic_score(a: str, b: str) -> float:
    """
    Returns cosine similarity in [-1, 1] using public API only.
    """
    m = get_bi_encoder()
    ea = m.encode([a or ""], normalize_embeddings=True, convert_to_numpy=True)[0]
    eb = m.encode([b or ""], normalize_embeddings=True, convert_to_numpy=True)[0]
    return float(util.cos_sim(ea, eb).item())

def warmup():
    # Safe warmup that never accesses private attributes
    _ = compute_deterministic_score("warmup", "warmup")

class AIService:
    """Legacy compatibility class that wraps the module-level functions"""
    def compute_application_score(self, application_data: dict, job_data: dict) -> float:
        # Build application text
        app_parts = []
        if application_data.get('education_level'):
            app_parts.append(f"Education: {application_data['education_level']}")
        if application_data.get('years_experience'):
            app_parts.append(f"Experience: {application_data['years_experience']} years")
        if application_data.get('cover_letter'):
            app_parts.append(f"Cover Letter: {application_data['cover_letter']}")

        # Build job text
        job_parts = []
        if job_data.get('title'):
            job_parts.append(f"Job Title: {job_data['title']}")
        if job_data.get('description'):
            job_parts.append(f"Job Description: {job_data['description']}")
        if job_data.get('requirements'):
            if isinstance(job_data['requirements'], list):
                job_parts.append(f"Requirements: {' -- '.join(job_data['requirements'])}")
            else:
                job_parts.append(f"Requirements: {job_data['requirements']}")

        application_text = " ".join(app_parts)
        job_text = " ".join(job_parts)

        # Use safe deterministic scoring
        bi_score = compute_deterministic_score(application_text, job_text)

        # Enhanced scoring with cross-encoder if enabled
        use_cross = os.getenv("USE_CROSS_ENCODER", "true").lower() in {"1", "true", "yes"}
        if use_cross and len(application_text.split()) > 10 and len(job_text.split()) > 10:
            try:
                cross_encoder = get_cross_encoder()
                raw = cross_encoder.predict([(application_text, job_text)])[0]
                cross_score = 1 / (1 + np.exp(-raw))
                # Blend scores: 70% cross-encoder, 30% bi-encoder
                return float(max(0.0, min(1.0, 0.7 * cross_score + 0.3 * bi_score)))
            except Exception:
                pass

        return bi_score

# Global service instance for backward compatibility
ai_service = AIService()
