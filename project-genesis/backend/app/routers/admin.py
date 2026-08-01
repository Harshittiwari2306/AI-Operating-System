from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/admin", tags=["Admin Controls"])

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    admin_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()

@router.get("/logs", response_model=List[schemas.LogResponse])
def get_system_logs(
    admin_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.SystemLog).order_by(models.SystemLog.timestamp.desc()).limit(100).all()

@router.delete("/logs", status_code=status.HTTP_204_NO_CONTENT)
def clear_system_logs(
    admin_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    db.query(models.SystemLog).delete()
    db.commit()
    return None

@router.get("/stats")
def get_admin_dashboard_stats(
    admin_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(models.User).count()
    total_tasks = db.query(models.Task).count()
    total_files = db.query(models.UploadedFile).count()
    total_notes = db.query(models.Note).count()
    
    # Calculate role counts
    user_roles = db.query(models.User).filter(models.User.role == "user").count()
    admin_roles = db.query(models.User).filter(models.User.role == "admin").count()
    
    return {
        "total_users": total_users,
        "total_tasks_logged": total_tasks,
        "total_files_uploaded": total_files,
        "total_notes_created": total_notes,
        "roles": {
            "users": user_roles,
            "admins": admin_roles
        }
    }
