from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime

DATABASE_URL = "sqlite:///./healthcare.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── MODELS ───────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id          = Column(Integer, primary_key=True, index=True)
    full_name   = Column(String, nullable=False)
    email       = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role        = Column(String, nullable=False)  # hasta_yakini | hasta_bakici
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)


class TaskTemplate(Base):
    __tablename__ = "task_templates"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String, nullable=False)
    description  = Column(Text, nullable=True)
    default_time = Column(String, nullable=True)  # "08:00"
    task_type    = Column(String, default="normal")  # normal | medication
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at   = Column(DateTime, default=datetime.utcnow)


class TaskInstance(Base):
    __tablename__ = "task_instances"

    id                   = Column(Integer, primary_key=True, index=True)
    template_id          = Column(Integer, ForeignKey("task_templates.id"), nullable=True)
    title                = Column(String, nullable=False)
    description          = Column(Text, nullable=True)
    scheduled_for        = Column(DateTime, nullable=False)
    status               = Column(String, default="pending")
    # pending | in_progress | done | problem | resolved | cancelled

    problem_message      = Column(Text, nullable=True)
    problem_severity     = Column(String, nullable=True)  # hafif | orta | ciddi
    resolution_note      = Column(Text, nullable=True)
    completion_photo_url = Column(String, nullable=True)

    rating               = Column(Float, nullable=True)   # 1.0 - 5.0
    review_note          = Column(Text, nullable=True)

    created_by_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id       = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow)
    updated_at           = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("users.id"), nullable=False)
    title              = Column(String, nullable=True, default="Bildirim")
    message            = Column(Text, nullable=False)
    related_user_name  = Column(String, nullable=True)
    is_read            = Column(Boolean, default=False)
    created_at         = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content     = Column(Text, nullable=False)
    is_read     = Column(Boolean, default=False)
    is_edited   = Column(Boolean, default=False)
    is_deleted  = Column(Boolean, default=False)
    sent_at     = Column(DateTime, default=datetime.utcnow)


class MessageAttachment(Base):
    __tablename__ = "message_attachments"

    id         = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    file_type  = Column(String, nullable=False)   # image | file
    file_path  = Column(String, nullable=False)
    file_name  = Column(String, nullable=True)


# ─── DB INIT ──────────────────────────────────────────────────

def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
