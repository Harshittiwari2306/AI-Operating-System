from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime
from app.database import get_db
from app import models, auth
from app.routers.productivity import get_productivity_score

router = APIRouter(prefix="/dashboard", tags=["AI Dashboard Overview"])

@router.get("/")
def get_dashboard_summary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Today's bounds
    today_start = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    today_end = datetime.datetime.combine(datetime.date.today(), datetime.time.max)
    three_days_later = today_end + datetime.timedelta(days=3)
    
    # 1. Today's Tasks
    today_tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.completed == False,
        models.Task.due_date >= today_start,
        models.Task.due_date <= today_end
    ).all()
    
    # 2. Upcoming Deadlines (next 3 days, excluding today)
    upcoming_deadlines = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.completed == False,
        models.Task.due_date > today_end,
        models.Task.due_date <= three_days_later
    ).all()
    
    # 3. Today's Calendar Events
    today_events = db.query(models.CalendarEvent).filter(
        models.CalendarEvent.user_id == current_user.id,
        models.CalendarEvent.start_time >= today_start,
        models.CalendarEvent.start_time <= today_end
    ).all()
    
    # 4. Expense Summary (Current Month)
    first_day_of_month = datetime.datetime(datetime.date.today().year, datetime.date.today().month, 1)
    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id,
        models.Expense.date >= first_day_of_month,
        models.Expense.type == "expense"
    ).all()
    monthly_expenses_sum = sum(e.amount for e in expenses)
    
    # 5. Habit Streaks (Streaks for active habits)
    habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id).limit(4).all()
    habit_summary = [
        {"name": h.name, "category": h.category, "streak": h.streak, "completed_today": datetime.date.today().strftime("%Y-%m-%d") in (h.completions or [])}
        for h in habits
    ]
    
    # 6. Latest Mood Status
    latest_mood = db.query(models.MoodJournal).filter(
        models.MoodJournal.user_id == current_user.id
    ).order_by(models.MoodJournal.date.desc()).first()
    
    # 7. Unread Notifications
    unread_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).order_by(models.Notification.created_at.desc()).limit(5).all()
    
    # 8. Live Productivity Score
    prod_score_res = get_productivity_score(current_user, db)
    
    return {
        "today_tasks": [
            {"id": t.id, "title": t.title, "priority": t.priority, "category": t.category, "due_date": t.due_date}
            for t in today_tasks
        ],
        "upcoming_deadlines": [
            {"id": t.id, "title": t.title, "priority": t.priority, "due_date": t.due_date}
            for t in upcoming_deadlines
        ],
        "today_events": [
            {"id": e.id, "title": e.title, "start_time": e.start_time, "end_time": e.end_time}
            for e in today_events
        ],
        "expenses_summary": {
            "total_expenses_month": round(monthly_expenses_sum, 2),
            "currency": "USD"
        },
        "habits": habit_summary,
        "latest_mood": {
            "sentiment": latest_mood.sentiment if latest_mood else "Neutral",
            "mood_score": latest_mood.mood_score if latest_mood else 5,
            "emotions": latest_mood.emotions if latest_mood else ["Calm"]
        } if latest_mood else None,
        "notifications": [
            {"id": n.id, "title": n.title, "message": n.message, "type": n.type, "created_at": n.created_at}
            for n in unread_notifications
        ],
        "productivity_score": prod_score_res["productivity_score"],
        "study_progress": {
            "completed_hours": prod_score_res["study_hours_today"],
            "target_hours": prod_score_res["study_hours_goal"]
        }
    }
