from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from app.database import get_db
from app import models, schemas, auth
from app.services.analysis_service import HabitPredictor

router = APIRouter(prefix="/habits", tags=["Habits Tracker"])

@router.post("/", response_model=schemas.HabitResponse, status_code=status.HTTP_201_CREATED)
def create_habit(
    habit_in: schemas.HabitCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Allowed categories validation
    valid_categories = ["Water", "Exercise", "Sleep", "Reading", "Coding", "Meditation"]
    if habit_in.category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )
        
    new_habit = models.Habit(
        user_id=current_user.id,
        name=habit_in.name,
        category=habit_in.category,
        target_frequency=habit_in.target_frequency,
        completions=[],
        streak=0
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit

@router.get("/", response_model=List[schemas.HabitResponse])
def get_habits(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Habit).filter(models.Habit.user_id == current_user.id).all()

@router.post("/{habit_id}/complete", response_model=schemas.HabitResponse)
def complete_habit(
    habit_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    # Avoid duplicate logging on the same day
    completions_list = list(habit.completions or [])
    if today_str in completions_list:
        return habit
        
    completions_list.append(today_str)
    habit.completions = completions_list
    
    # Recalculate streak
    # Check if yesterday was completed
    yesterday_str = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    if yesterday_str in completions_list or len(completions_list) == 1:
        habit.streak += 1
    else:
        habit.streak = 1 # broke streak but restarted today
        
    db.commit()
    db.refresh(habit)
    return habit

@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(habit_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return None

@router.get("/predictions")
def get_habit_predictions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id).all()
    results = []
    
    for h in habits:
        completions = h.completions or []
        analysis = HabitPredictor.analyze_habit(completions, h.target_frequency)
        results.append({
            "habit_id": h.id,
            "name": h.name,
            "category": h.category,
            "streak": h.streak,
            "consistency_rate": analysis["consistency_rate"],
            "prediction_rate": analysis["predicted_completion_rate"],
            "suggestion": analysis["recommendation"]
        })
        
    return results
