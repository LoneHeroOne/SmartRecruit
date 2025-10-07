from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float, DateTime, Date
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

class Internship(Base):
    __tablename__ = "internships"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    requirements = Column(Text, nullable=True)  # JSON string or comma separated
    deadline = Column(Date, nullable=True)

    applications = relationship("Application", back_populates="internship")

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
    score = Column(Float, nullable=True)  # ML matching score
    applied_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    internship_id = Column(Integer, ForeignKey("internships.id"))

    user = relationship("User", back_populates="applications")
    internship = relationship("Internship", back_populates="applications")
