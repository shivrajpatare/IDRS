from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    permissions_json = Column(JSON)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role")
    profile = relationship("CitizenProfile", back_populates="user", uselist=False)

class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    language = Column(String)
    district_id = Column(String)
    family_json = Column(JSON)
    vulnerability_flags = Column(JSON)
    consent_flags = Column(JSON)

    user = relationship("User", back_populates="profile")
