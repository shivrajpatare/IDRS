from models.database import engine, Base
import models.domain 
import models.users
import models.operations

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Database schema reset successfully.")
