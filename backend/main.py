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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_tables()


app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(notifications.router)
app.include_router(messages.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "HealthCare API çalışıyor."}
