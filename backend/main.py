from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import create_tables
from routers import auth, tasks, users, notifications, messages

app = FastAPI(
    title="HealthCare App API",
    description="Hasta Bakım Yönetim Sistemi — FastAPI Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:8082", "http://localhost:19006", "http://localhost:19000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_tables()
    # Column migrations for new fields
    from sqlalchemy import text
    from database import engine
    migrations = [
        "ALTER TABLE notifications ADD COLUMN title TEXT",
        "ALTER TABLE notifications ADD COLUMN related_user_name TEXT",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass


app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(notifications.router)
app.include_router(messages.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "HealthCare API çalışıyor."}
