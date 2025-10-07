from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    cvs = relationship("CV", back_populates="owner")
    applications = relationship("Application", back_populates="user")

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    requirements = Column(Text, nullable=True)  # JSON string or comma separated
    deadline = Column(Date, nullable=True)
    contract_type = Column(String, nullable=True)  # New field

    applications = relationship("Application", back_populates="job")

class CV(Base):
    __tablename__ = "cvs"
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="cvs")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    score = Column(Float, nullable=True)  # ML matching score (deprecated)
    applied_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default='submitted')

    # New application form fields
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    years_experience = Column(Integer, nullable=True)
    linkedin_url = Column(String, nullable=True)
    cover_letter = Column(Text, nullable=True)

    # Remove cv_id as we're not using CV matching anymore
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class MatchAnalysis(Base):
    __tablename__ = "match_analyses"
    id = Column(Integer, primary_key=True, index=True)
    keywords_matched = Column(Text, nullable=True)

    cv_id = Column(Integer, ForeignKey("cvs.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
