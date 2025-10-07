from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models
from app.database import engine
from app.routers import users, internships, cvs, applications

# Create DB tables if not using Alembic (for dev)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Internship Matching API")

# Allow frontend (React) to call backend
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(internships.router, prefix="/internships", tags=["internships"])
app.include_router(cvs.router, prefix="/cvs", tags=["cvs"])
app.include_router(applications.router, prefix="/applications", tags=["applications"])
