from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db, Notification
from schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/{user_id}", response_model=List[NotificationOut])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch("/read/{notification_id}", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif


@router.patch("/read-all/{user_id}")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"detail": "Tüm bildirimler okundu olarak işaretlendi."}


@router.patch("/read-by-sender/{user_id}/{sender_id}")
def mark_read_by_sender(user_id: int, sender_id: int, db: Session = Depends(get_db)):
    """Belirli bir gönderenin mesaj bildirimlerini toplu okundu yap."""
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.related_user_id == sender_id,
        Notification.type == "message",
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"detail": "Mesaj bildirimleri okundu olarak işaretlendi."}
