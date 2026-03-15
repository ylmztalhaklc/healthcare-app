from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import get_db, TaskInstance, Notification
from schemas import TaskInstanceCreate, TaskInstanceOut, TaskStatusUpdate, TaskRating

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskInstanceOut)
def create_task(body: TaskInstanceCreate, db: Session = Depends(get_db)):
    task = TaskInstance(
        template_id=body.template_id,
        title=body.title,
        description=body.description,
        scheduled_for=body.scheduled_for,
        assigned_to_id=body.assigned_to_id,
        created_by_id=1,  # TODO: extract from JWT
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Notify caregiver if assigned
    if task.assigned_to_id:
        notif = Notification(
            user_id=task.assigned_to_id,
            message=f"Yeni görev atandı: {task.title}"
        )
        db.add(notif)
        db.commit()

    return task


@router.get("/relative/{user_id}", response_model=List[TaskInstanceOut])
def get_relative_tasks(user_id: int, date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TaskInstance).filter(TaskInstance.created_by_id == user_id)
    if date:
        target = datetime.fromisoformat(date)
        query = query.filter(
            TaskInstance.scheduled_for >= target.replace(hour=0, minute=0, second=0),
            TaskInstance.scheduled_for <= target.replace(hour=23, minute=59, second=59),
        )
    return query.order_by(TaskInstance.scheduled_for).all()


@router.get("/caregiver/{user_id}", response_model=List[TaskInstanceOut])
def get_caregiver_tasks(user_id: int, date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TaskInstance).filter(TaskInstance.assigned_to_id == user_id)
    if date:
        target = datetime.fromisoformat(date)
        query = query.filter(
            TaskInstance.scheduled_for >= target.replace(hour=0, minute=0, second=0),
            TaskInstance.scheduled_for <= target.replace(hour=23, minute=59, second=59),
        )
    return query.order_by(TaskInstance.scheduled_for).all()


@router.patch("/status", response_model=TaskInstanceOut)
def update_task_status(body: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.query(TaskInstance).filter(TaskInstance.id == body.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")
    task.status = body.status
    if body.problem_message:
        task.problem_message = body.problem_message
        task.problem_severity = body.problem_severity
        # Notify relative about problem
        notif = Notification(
            user_id=task.created_by_id,
            message=f"Görevde sorun bildirildi: {task.title}"
        )
        db.add(notif)
    if body.resolution_note:
        task.resolution_note = body.resolution_note
    db.commit()
    db.refresh(task)
    return task


@router.patch("/rate", response_model=TaskInstanceOut)
def rate_task(body: TaskRating, db: Session = Depends(get_db)):
    task = db.query(TaskInstance).filter(TaskInstance.id == body.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")
    task.rating = body.rating
    task.review_note = body.review_note
    db.commit()
    db.refresh(task)
    return task


@router.get("/stats/relative/{user_id}")
def relative_stats(user_id: int, db: Session = Depends(get_db)):
    tasks = db.query(TaskInstance).filter(TaskInstance.created_by_id == user_id).all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "tamamlandi")
    active = sum(1 for t in tasks if t.status == "bekliyor")
    problems = sum(1 for t in tasks if t.problem_message)
    resolved = sum(1 for t in tasks if t.resolution_note)
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "active_tasks": active,
        "completion_rate": round(completed / total * 100, 1) if total else 0,
        "problems_reported": problems,
        "problems_resolved": resolved,
    }


@router.get("/stats/caregiver/{user_id}")
def caregiver_stats(user_id: int, db: Session = Depends(get_db)):
    tasks = db.query(TaskInstance).filter(TaskInstance.assigned_to_id == user_id).all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "tamamlandi")
    ratings = [t.rating for t in tasks if t.rating is not None]
    today = datetime.utcnow().date()
    tasks_today = sum(1 for t in tasks if t.scheduled_for.date() == today)
    return {
        "total_assigned": total,
        "completed_tasks": completed,
        "completion_rate": round(completed / total * 100, 1) if total else 0,
        "avg_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
        "tasks_today": tasks_today,
    }
