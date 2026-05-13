from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.settings import settings
import os

DATABASE_URL = settings.database_url
# if "sqlite" in DATABASE_URL and not os.getenv("ALLOW_SQLITE", "").lower() == "true":
#     raise ValueError("SQLite does not support GeoAlchemy2 spatial types. Use PostgreSQL with PostGIS. Set ALLOW_SQLITE=true to override for testing.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
