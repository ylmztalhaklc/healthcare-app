from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime

from database import get_db, Message, Notification, User, MessageAttachment
from schemas import MessageSend, MessageEdit, MessageOut, MessageAttachmentOut
from sqlalchemy import or_, desc

router = APIRouter(prefix="/messages", tags=["messages"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _build_msg_out(msg, attachments):
    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "is_read": msg.is_read,
        "is_edited": msg.is_edited,
        "is_deleted": msg.is_deleted,
        "sent_at": msg.sent_at.isoformat(),
        "attachments": [{"id": a.id, "message_id": a.message_id, "file_path": a.file_path, "file_type": a.file_type, "file_name": a.file_name} for a in attachments],
    }


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

    sender = db.query(User).filter(User.id == body.sender_id).first()
    sender_name = sender.full_name if sender else "Biri"
    notif = Notification(
        user_id=body.receiver_id,
        title="Yeni Mesaj",
        message=f"{sender_name} size mesaj gönderdi.",
    )
    db.add(notif)
    db.commit()
    return _build_msg_out(msg, [])


@router.get("/conversation/{user_a}/{user_b}")
def get_conversation(user_a: int, user_b: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        ((Message.sender_id == user_a) & (Message.receiver_id == user_b)) |
        ((Message.sender_id == user_b) & (Message.receiver_id == user_a))
    ).order_by(Message.sent_at).all()
    result = []
    for msg in messages:
        attachments = db.query(MessageAttachment).filter(MessageAttachment.message_id == msg.id).all()
        result.append(_build_msg_out(msg, attachments))
    return result

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
                    "last_message_time": msg.sent_at.isoformat(),
                    "sent_at": msg.sent_at.isoformat(),
                    "unread_count": 0
                }

    # Count unread messages per conversation
    for contact_id in list(contacts.keys()):
        unread = db.query(Message).filter(
            Message.sender_id == contact_id,
            Message.receiver_id == user_id,
            Message.is_read == False,
            Message.is_deleted == False
        ).count()
        contacts[contact_id]["unread_count"] = unread

    return list(contacts.values())



@router.patch("/read-all/{receiver_id}/{sender_id}")
def mark_all_read_from(receiver_id: int, sender_id: int, db: Session = Depends(get_db)):
    updated = db.query(Message).filter(
        Message.sender_id == sender_id,
        Message.receiver_id == receiver_id,
        Message.is_read == False,
        Message.is_deleted == False,
    ).update({"is_read": True})
    db.commit()
    return {"updated": updated}


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
    return _build_msg_out(msg, [])


@router.delete("/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    msg.is_deleted = True
    msg.content = "Bu mesaj silindi."
    db.commit()
    return {"detail": "Mesaj silindi."}


@router.post("/{message_id}/attachment")
async def upload_message_attachment(message_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"msg_{message_id}_{int(datetime.utcnow().timestamp())}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    attachment = MessageAttachment(
        message_id=message_id,
        file_type="image",
        file_path=f"/uploads/{filename}",
        file_name=filename,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return {"url": f"/uploads/{filename}", "id": attachment.id}
