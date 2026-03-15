from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db, User
from schemas import UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).filter(User.is_active == True).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    return user


@router.get("/role/{role}", response_model=List[UserOut])
def get_users_by_role(role: str, db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == role, User.is_active == True).all()
