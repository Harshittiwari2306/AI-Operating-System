import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base

# Import all routers
from app.routers import (
    auth,
    dashboard,
    tasks,
    calendar,
    study,
    notes,
    rag,
    chat,
    finance,
    habits,
    mood,
    productivity,
    recommendations,
    admin,
    voice,
    notifications,
)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Error creating database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The intelligent backend engine for Project Genesis AI OS",
    version="1.0.0",
)

# -----------------------------
# CORS Configuration
# -----------------------------
origins = [
    "http://localhost:5173",   # Local Vite
    "http://localhost:3000",   # Local React
    "https://ai-operating-system-hlp7bzudx-codingwithself45-1565s-projects.vercel.app",  # Vercel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Static Files
# -----------------------------
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="static",
)

# -----------------------------
# API Routers
# -----------------------------
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(study.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(rag.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(finance.router, prefix="/api")
app.include_router(habits.router, prefix="/api")
app.include_router(mood.router, prefix="/api")
app.include_router(productivity.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

# -----------------------------
# Root Endpoint
# -----------------------------
@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "message": "Welcome to Project Genesis AI Operating System. Use /docs for API Explorer."
    }