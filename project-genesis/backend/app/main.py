import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine

# Routers
from app.routers import (
    admin,
    auth,
    calendar,
    chat,
    dashboard,
    finance,
    habits,
    mood,
    notes,
    notifications,
    productivity,
    rag,
    recommendations,
    study,
    tasks,
    voice,
)

# --------------------------------------------------
# Create database tables
# --------------------------------------------------
try:
    Base.metadata.create_all(bind=engine)
    print("Database connected successfully.")
except Exception as e:
    print("Database Error:", e)

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Project Genesis AI Operating System",
    version="1.0.0",
)

# --------------------------------------------------
# CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,

    # Allow localhost + ALL vercel deployments
    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Global Exception Handler
# --------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    print("=" * 70)
    print("UNHANDLED EXCEPTION")
    print(type(exc).__name__)
    print(str(exc))
    print("=" * 70)

    return JSONResponse(
        status_code=500,
        content={
            "error": type(exc).__name__,
            "message": str(exc),
        },
    )

# --------------------------------------------------
# Upload Folder
# --------------------------------------------------
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.mount(
    "/static",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="static",
)

# --------------------------------------------------
# API Routes
# --------------------------------------------------
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

# --------------------------------------------------
# Health Check
# --------------------------------------------------
@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "message": "Project Genesis Backend Running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }