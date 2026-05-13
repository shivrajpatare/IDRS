from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from core.auth import (
    authenticate_user_db, create_access_token, create_refresh_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM, get_current_user,
    get_password_hash
)
from models.database import get_db
from models.users import User, Role
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Default role is Citizen (assume role_id 3 based on my seed)
    citizen_role = db.query(Role).filter(Role.name == "Citizen").first()
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        role_id=citizen_role.id if citizen_role else None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.post("/token")
def login_for_access_token(
    response: Response, 
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = authenticate_user_db(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.name if user.role else "citizen"})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    # Task 4: Store refresh token in httpOnly cookie
    response.set_cookie(
        key="idrs_refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True, # In production
        samesite="lax",
        max_age=7 * 24 * 60 * 60 # 7 days
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh")
def refresh_access_token(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("idrs_refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        email: str = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        access_token = create_access_token(data={"sub": user.email, "role": user.role.name if user.role else "citizen"})
        return {"access_token": access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("idrs_refresh_token")
    return {"message": "Logged out"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.name if current_user.role else "CITIZEN"
    }
