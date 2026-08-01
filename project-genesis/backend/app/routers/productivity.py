from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
from app.database import get_db
from app import models, auth
from app.services.analysis_service import ProductivityScorer

router = APIRouter(prefix="/productivity", tags=["Productivity Analytics"])

@router.get("/score")
def get_productivity_score(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Get task statistics
    total_tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).count()
    completed_tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.completed == True
    ).count()
    
    # Get habit consistency
    habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id).all()
    habit_rates = []
    for h in habits:
        completions = h.completions or []
        # Calculate completion rate last 14 days
        today = datetime.date.today()
        recent = sum(1 for d in completions if (today - datetime.datetime.strptime(d, "%Y-%m-%d").date()).days <= 14)
        habit_rates.append((recent / 14.0) * 100)
    avg_habit_consistency = sum(habit_rates) / len(habit_rates) if habit_rates else 70.0
    
    # Get mood score
    latest_mood = db.query(models.MoodJournal).filter(
        models.MoodJournal.user_id == current_user.id
    ).order_by(models.MoodJournal.date.desc()).first()
    mood_val = latest_mood.mood_score if latest_mood else 6
    
    # Calculate mock study hours today
    # Sum calendar events today that mention 'study' or 'class'
    today_start = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    today_end = datetime.datetime.combine(datetime.date.today(), datetime.time.max)
    study_events = db.query(models.CalendarEvent).filter(
        models.CalendarEvent.user_id == current_user.id,
        models.CalendarEvent.start_time >= today_start,
        models.CalendarEvent.start_time <= today_end,
        (models.CalendarEvent.title.ilike("%study%") | models.CalendarEvent.title.ilike("%class%") | models.CalendarEvent.title.ilike("%read%"))
    ).all()
    
    study_hours = 0.0
    for e in study_events:
        duration = (e.end_time - e.start_time).total_seconds() / 3600.0
        study_hours += duration
        
    # If no calendar study events, check latest study plan as base
    if study_hours == 0.0:
        latest_plan = db.query(models.StudyPlan).filter(
            models.StudyPlan.user_id == current_user.id
        ).order_by(models.StudyPlan.created_at.desc()).first()
        study_hours = latest_plan.available_hours if latest_plan else 2.0
        
    score = ProductivityScorer.calculate_score(
        completed_tasks=completed_tasks,
        total_tasks=total_tasks,
        habit_consistency=avg_habit_consistency,
        mood_score=mood_val,
        study_hours=study_hours,
        study_goal=current_user.daily_hours_goal
    )
    
    return {
        "productivity_score": score,
        "tasks_completed": completed_tasks,
        "tasks_total": total_tasks,
        "habit_consistency": avg_habit_consistency,
        "mood_score": mood_val,
        "study_hours_today": study_hours,
        "study_hours_goal": current_user.daily_hours_goal
    }

@router.get("/analytics")
def get_analytics_graphs(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Weekly hours category (Study, Coding, Reading, Exercise)
    # Mock data calculation from habits logs
    habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id).all()
    category_hours = {"Study": 12, "Coding": 8, "Reading": 4, "Exercise": 5} # defaults
    
    for h in habits:
        completions_count = len(h.completions or [])
        if h.category == "Coding":
            category_hours["Coding"] = max(8, completions_count * 1.5)
        elif h.category == "Reading":
            category_hours["Reading"] = max(4, completions_count * 1.0)
        elif h.category == "Exercise":
            category_hours["Exercise"] = max(5, completions_count * 1.2)
            
    # Add study planner hours
    latest_plan = db.query(models.StudyPlan).filter(models.StudyPlan.user_id == current_user.id).order_by(models.StudyPlan.created_at.desc()).first()
    if latest_plan:
        category_hours["Study"] = latest_plan.available_hours * 5 # mock weekly study
        
    # 2. Activity Heatmap data (last 30 days)
    # Generate list of past 30 days, counting tasks completed, notes written, habits logged
    today = datetime.date.today()
    heatmap_data = []
    for i in range(30):
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        
        # Count events on day
        start = datetime.datetime.combine(day, datetime.time.min)
        end = datetime.datetime.combine(day, datetime.time.max)
        
        task_count = db.query(models.Task).filter(
            models.Task.user_id == current_user.id,
            models.Task.completed == True,
            models.Task.due_date >= start,
            models.Task.due_date <= end
        ).count()
        
        note_count = db.query(models.Note).filter(
            models.Note.user_id == current_user.id,
            models.Note.created_at >= start,
            models.Note.created_at <= end
        ).count()
        
        # Habits check-ins count
        habit_check_count = 0
        for h in habits:
            if day_str in (h.completions or []):
                habit_check_count += 1
                
        activity_count = task_count + note_count + habit_check_count
        heatmap_data.append({"date": day_str, "value": activity_count})
        
    return {
        "distribution": category_hours,
        "heatmap": heatmap_data,
        "daily_trend": [
            {"day": "Mon", "score": 65},
            {"day": "Tue", "score": 72},
            {"day": "Wed", "score": 80},
            {"day": "Thu", "score": 75},
            {"day": "Fri", "score": 88},
            {"day": "Sat", "score": 90},
            {"day": "Sun", "score": 85}
        ]
    }
