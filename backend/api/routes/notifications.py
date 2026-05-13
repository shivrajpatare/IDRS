from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from core.auth import get_current_user
from models.database import get_db
from models.users import User
from models.domain import NotificationToken

router = APIRouter()

class TokenRegistration(BaseModel):
    token: str
    device_type: str = "web"

@router.post("/register-token")
def register_token(req: TokenRegistration, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Register or update an FCM token for the authenticated user.
    """
    # Check if token already exists
    existing = db.query(NotificationToken).filter(NotificationToken.token == req.token).first()
    
    if existing:
        if existing.user_id != current_user.id:
            # Token belongs to another user now (e.g. device changed hands/logins)
            existing.user_id = current_user.id
        existing.last_used_at = datetime.utcnow()
        existing.is_active = True
    else:
        # Create new token record
        new_token = NotificationToken(
            user_id=current_user.id,
            token=req.token,
            device_type=req.device_type
        )
        db.add(new_token)
        
    db.commit()
    return {"status": "success", "message": "Token registered successfully"}
