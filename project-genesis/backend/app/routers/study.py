from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
from app.services.ai_service import StudyPlannerAI

router = APIRouter(prefix="/study", tags=["Study Planner"])

@router.post("/", response_model=schemas.StudyPlanResponse)
def create_study_plan(plan_in: schemas.StudyPlanCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Generate study schedule via LLM / fallback
    generated = StudyPlannerAI.generate_plan(
        subjects=plan_in.subjects,
        exam_date=plan_in.exam_date,
        available_hours=plan_in.available_hours
    )
    
    new_plan = models.StudyPlan(
        user_id=current_user.id,
        subjects=plan_in.subjects,
        exam_date=plan_in.exam_date,
        available_hours=plan_in.available_hours,
        schedule=generated.get("daily_schedule", []),
        revision_plan=generated
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    
    # Log event
    log = models.SystemLog(user_id=current_user.id, action="STUDY_PLAN_CREATE", details=f"Created study plan for: {', '.join(plan_in.subjects)}")
    db.add(log)
    
    # Create notification reminder about exams
    notif = models.Notification(
        user_id=current_user.id,
        title="Exam Preparation Plan Generated",
        message=f"Genesis AI has structured your preparation schedule for: {', '.join(plan_in.subjects)}. Check it out!",
        type="Exam"
    )
    db.add(notif)
    db.commit()
    
    return new_plan

@router.get("/latest", response_model=schemas.StudyPlanResponse)
def get_latest_study_plan(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    plan = db.query(models.StudyPlan).filter(
        models.StudyPlan.user_id == current_user.id
    ).order_by(models.StudyPlan.created_at.desc()).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="No study plan found. Go ahead and generate one!")
    return plan

@router.get("/", response_model=List[schemas.StudyPlanResponse])
def get_all_study_plans(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.StudyPlan).filter(models.StudyPlan.user_id == current_user.id).all()
