from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db, Message, Notification, User
from schemas import MessageSend, MessageEdit, MessageOut
from sqlalchemy import or_, desc

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/", response_model=MessageOut)
def send_message(body: MessageSend, db: Session = Depends(get_db)):
    msg = Message(
        sender_id=body.sender_id,
        receiver_id=body.receiver_id,
        content=body.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    notif = Notification(
        user_id=body.receiver_id,
        message="Yeni mesajınız var."
    )
    db.add(notif)
    db.commit()
    return msg


@router.get("/conversation/{user_a}/{user_b}", response_model=List[MessageOut])
def get_conversation(user_a: int, user_b: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        ((Message.sender_id == user_a) & (Message.receiver_id == user_b)) |
        ((Message.sender_id == user_b) & (Message.receiver_id == user_a))
    ).order_by(Message.sent_at).all()
    return messages

@router.get("/user/{user_id}/conversations")
def get_user_conversations(user_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(desc(Message.sent_at)).all()
    
    contacts = {}
    for msg in messages:
        contact_id = msg.sender_id if msg.receiver_id == user_id else msg.receiver_id
        if contact_id not in contacts:
            contact_user = db.query(User).filter(User.id == contact_id).first()
            if contact_user:
                contacts[contact_id] = {
                    "id": contact_user.id,
                    "name": contact_user.full_name,
                    "last_message": msg.content,
                    "sent_at": msg.sent_at.isoformat()
                }
    return list(contacts.values())



@router.patch("/read/{message_id}", response_model=MessageOut)
def mark_read(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg


@router.patch("/edit", response_model=MessageOut)
def edit_message(body: MessageEdit, db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == body.message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    msg.content = body.new_content
    msg.is_edited = True
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    msg.is_deleted = True
    msg.content = "Bu mesaj silindi."
    db.commit()
    return {"detail": "Mesaj silindi."}
