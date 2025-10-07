# app/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# These options help with dropped/idle connections on serverless Postgres
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,     # checks connection before using it
    pool_recycle=1800,      # recycle every 30 min
    future=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
