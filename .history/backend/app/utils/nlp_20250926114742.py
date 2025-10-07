# app/utils/nlp.py
# Lightweight, dependency-light text extractor + similarity
# Requires: pip install python-docx scikit-learn pypdf
from typing import Any
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pypdf import PdfReader
from docx import Document
import os

# Small helper so we can define request bodies without touching schemas.py in this pass
class BaseModelLike(BaseModel):
    pass

def extract_text(path: str) -> str:
    if path.lower().endswith(".pdf"):
        reader = PdfReader(path)
        return "\n".join([p.extract_text() or "" for p in reader.pages])
    if path.lower().endswith(".docx"):
        doc = Document(path)
        return "\n".join([p.text for p in doc.paragraphs])
    if path.lower().endswith(".txt"):
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    raise ValueError(f"Unsupported file type for {os.path.basename(path)}")

def compute_similarity(a: str, b: str) -> float:
    vect = TfidfVectorizer(stop_words="english")
    X = vect.fit_transform([a, b])
    sim = cosine_similarity(X[0:1], X[1:2])[0][0]
    return float(max(0.0, min(1.0, sim)))
