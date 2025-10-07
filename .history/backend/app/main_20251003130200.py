# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app import models, auth
from app.database import engine
from app.routers import users, jobs, cvs, applications

load_dotenv()

# --- Create DB tables in dev only (use Alembic in prod) ---
if os.getenv("CREATE_TABLES", "false").lower() in {"1", "true", "yes"}:
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Matching API")

# --- CORS ---
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# Optionally override with comma-separated ORIGINS in .env
env_origins = os.getenv("CORS_ORIGINS")
origins = [o.strip() for o in env_origins.split(",")] if env_origins else default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(cvs.router, prefix="/cvs", tags=["cvs"])
app.include_router(applications.router, prefix="/applications", tags=["applications"])

# --- Simple health check ---
@app.get("/health")
def health():
    return {"status": "ok"}
