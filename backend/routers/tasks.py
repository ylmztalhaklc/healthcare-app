from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, timedelta
import os
import shutil

from database import get_db, TaskInstance, Notification, TaskTemplate, User
from schemas import TaskInstanceCreate, TaskInstanceOut, TaskStatusUpdate, TaskRating, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=TaskInstanceOut)
def create_task(body: TaskInstanceCreate, db: Session = Depends(get_db)):
    # Create template first
    template = db.query(TaskTemplate).filter(TaskTemplate.id == body.template_id).first()
    if not template and body.template_id is None:
        template = TaskTemplate(
            title=body.title,
            description=body.description,
            default_time=body.scheduled_for.strftime("%H:%M"),
            created_by_id=body.created_by_id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        body.template_id = template.id

    task = TaskInstance(
        template_id=body.template_id,
        title=body.title,
        description=body.description,
        scheduled_for=body.scheduled_for,
        assigned_to_id=body.assigned_to_id,
        created_by_id=body.created_by_id,  # Updated from hardcoded 1
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Notify caregiver if assigned
    if task.assigned_to_id:
        creator = db.query(User).filter(User.id == task.created_by_id).first()
        creator_name = creator.full_name if creator else "Hasta Yakını"
        notif = Notification(
            user_id=task.assigned_to_id,
            title="Yeni Görev Atandı",
            message=f"{creator_name} tarafından size yeni bir görev atandı: {task.title}",
            related_user_name=creator_name,
        )
        db.add(notif)
        db.commit()

    return task


@router.get("/relative/{user_id}", response_model=List[TaskInstanceOut])
def get_relative_tasks(user_id: int, date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TaskInstance).filter(
        or_(TaskInstance.created_by_id == user_id, TaskInstance.assigned_to_id == user_id)
    )
    if date:
        target = datetime.fromisoformat(date)
        query = query.filter(
            TaskInstance.scheduled_for >= target.replace(hour=0, minute=0, second=0),
            TaskInstance.scheduled_for <= target.replace(hour=23, minute=59, second=59),
        )
    return query.order_by(TaskInstance.scheduled_for).all()


@router.get("/caregiver/{user_id}", response_model=List[TaskInstanceOut])
def get_caregiver_tasks(user_id: int, date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TaskInstance).filter(
        or_(TaskInstance.assigned_to_id == user_id, TaskInstance.created_by_id == user_id)
    )
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
        caregiver = db.query(User).filter(User.id == body.user_id).first()
        caregiver_name = caregiver.full_name if caregiver else "Hasta Bakıcı"
        is_ciddi = body.problem_severity == 'ciddi'
        notif = Notification(
            user_id=task.created_by_id,
            title="⚠️ CİDDİ SORUN BİLDİRİLDİ" if is_ciddi else "Görevde Sorun Bildirildi",
            message=f"{caregiver_name} görevinizde CİDDİ sorun bildirdi: {task.title}" if is_ciddi
                    else f"{caregiver_name} görevinizde sorun bildirdi: {task.title}",
            related_user_name=caregiver_name,
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
    ciddi = sum(1 for t in tasks if t.problem_severity == 'ciddi')
    resolved = sum(1 for t in tasks if t.resolution_note)
    # Son 30 günlük sorun trendi (haftalık gruplar)
    today = datetime.utcnow().date()
    trend = []
    for w in range(4):
        week_end = today - timedelta(days=w * 7)
        week_start = week_end - timedelta(days=6)
        week_problems = sum(1 for t in tasks if t.problem_message and week_start <= t.scheduled_for.date() <= week_end)
        trend.insert(0, {"week": 3 - w, "count": week_problems})
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "active_tasks": active,
        "completion_rate": round(completed / total * 100, 1) if total else 0,
        "problems_reported": problems,
        "ciddi_problems": ciddi,
        "problems_resolved": resolved,
        "problem_trend": trend,
    }


@router.get("/stats/caregiver/{user_id}")
def caregiver_stats(user_id: int, db: Session = Depends(get_db)):
    tasks = db.query(TaskInstance).filter(TaskInstance.assigned_to_id == user_id).all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "tamamlandi")
    problems_reported = sum(1 for t in tasks if t.problem_message)
    ciddi_problems = sum(1 for t in tasks if t.problem_severity == 'ciddi')
    ratings = [t.rating for t in tasks if t.rating is not None]
    today = datetime.utcnow().date()
    tasks_today = sum(1 for t in tasks if t.scheduled_for.date() == today)

    # Weekly data: Mon=0 to Sun=6 (current week)
    week_start = today - timedelta(days=today.weekday())
    weekly_data = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_tasks = [t for t in tasks if t.scheduled_for.date() == day]
        day_total = len(day_tasks)
        day_comp = sum(1 for t in day_tasks if t.status == "tamamlandi")
        weekly_data.append({
            "day": i,
            "total": day_total,
            "completed": day_comp,
            "rate": round(day_comp / day_total * 100) if day_total else 0,
        })

    return {
        "total_assigned": total,
        "completed_tasks": completed,
        "completion_rate": round(completed / total * 100, 1) if total else 0,
        "avg_rating": round(sum(ratings) / len(ratings), 2) if ratings else 0,
        "tasks_today": tasks_today,
        "problems_reported": problems_reported,
        "ciddi_problems": ciddi_problems,
        "weekly_data": weekly_data,
    }


@router.post("/{task_id}/photo")
async def upload_task_photo(task_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    task = db.query(TaskInstance).filter(TaskInstance.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"task_{task_id}_{int(datetime.utcnow().timestamp())}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    task.completion_photo_url = f"/uploads/{filename}"
    db.commit()
    return {"url": f"/uploads/{filename}"}


@router.patch("/template/{template_id}", response_model=TaskInstanceOut)
def update_template(template_id: int, body: TaskUpdate, db: Session = Depends(get_db)):
    template = db.query(TaskTemplate).filter(TaskTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Görev şablonu bulunamadı.")
    if body.title is not None:
        template.title = body.title
    if body.description is not None:
        template.description = body.description
    # Bağlı tüm instance'ları da güncelle
    instances = db.query(TaskInstance).filter(TaskInstance.template_id == template_id).all()
    for inst in instances:
        if body.title is not None:
            inst.title = body.title
        if body.description is not None:
            inst.description = body.description
    db.commit()
    # İlk instance'ı döndür (yoksa 404)
    first = db.query(TaskInstance).filter(TaskInstance.template_id == template_id).first()
    if not first:
        raise HTTPException(status_code=404, detail="Bağlı görev bulunamadı.")
    db.refresh(first)
    return first


@router.delete("/template/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(TaskTemplate).filter(TaskTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Görev şablonu bulunamadı.")
    # Önce bağlı instance'ları sil
    db.query(TaskInstance).filter(TaskInstance.template_id == template_id).delete()
    db.delete(template)
    db.commit()
    return {"message": "Görev ve şablonu başarıyla silindi.", "template_id": template_id}


@router.patch("/{task_id}", response_model=TaskInstanceOut)
def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(TaskInstance).filter(TaskInstance.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")
    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    if body.scheduled_for is not None:
        task.scheduled_for = body.scheduled_for
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskInstance).filter(TaskInstance.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")
    db.delete(task)
    db.commit()
    return {"message": "Görev başarıyla silindi.", "task_id": task_id}
