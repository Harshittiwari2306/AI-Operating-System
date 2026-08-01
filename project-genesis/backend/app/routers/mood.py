from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas, auth
from app.services.analysis_service import MoodAnalyzer

router = APIRouter(prefix="/mood", tags=["Mood Journal"])

@router.post("/", response_model=schemas.MoodJournalResponse, status_code=status.HTTP_201_CREATED)
def log_mood(
    journal_in: schemas.MoodJournalCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Analyze text sentiment and emotions
    sentiment, emotions, score = MoodAnalyzer.analyze_text(journal_in.entry)
    
    new_entry = models.MoodJournal(
        user_id=current_user.id,
        entry=journal_in.entry,
        sentiment=sentiment,
        emotions=emotions,
        mood_score=score,
        date=datetime.utcnow()
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    # Create system log
    log = models.SystemLog(
        user_id=current_user.id,
        action="MOOD_JOURNAL_CREATE",
        details=f"Mood: {sentiment} (Score: {score}/10). Emotions: {', '.join(emotions)}"
    )
    db.add(log)
    db.commit()
    
    return new_entry

@router.get("/", response_model=List[schemas.MoodJournalResponse])
def get_moods(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.MoodJournal).filter(models.MoodJournal.user_id == current_user.id).order_by(models.MoodJournal.date.desc()).all()

@router.get("/analytics")
def get_mood_analytics(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    entries = db.query(models.MoodJournal).filter(
        models.MoodJournal.user_id == current_user.id,
        models.MoodJournal.date >= thirty_days_ago
    ).all()
    
    if not entries:
        return {
            "average_score": 5.0,
            "sentiment_counts": {"Positive": 0, "Neutral": 0, "Negative": 0},
            "emotion_counts": {},
            "insight": "Write your first journal entry to receive mood analytics!"
        }
        
    scores = [e.mood_score for e in entries]
    avg_score = sum(scores) / len(scores)
    
    sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    emotion_counts = {}
    
    for e in entries:
        sentiment_counts[e.sentiment] = sentiment_counts.get(e.sentiment, 0) + 1
        for emo in e.emotions:
            emotion_counts[emo] = emotion_counts.get(emo, 0) + 1
            
    # Generate weekly insights
    pos_ratio = sentiment_counts["Positive"] / len(entries)
    if pos_ratio > 0.6:
        insight = "Excellent! You are maintaining a highly positive mental state. Keep up the activities that spark joy."
    elif sentiment_counts["Negative"] > sentiment_counts["Positive"]:
        insight = "We detected elevated levels of negative sentiments. Consider planning shorter study sessions and scheduling regular breaks to recharge."
    else:
        insight = "Your overall emotional state is balanced. Focus on building solid sleep and exercise habits to boost energy."
        
    return {
        "average_score": round(avg_score, 1),
        "sentiment_counts": sentiment_counts,
        "emotion_counts": emotion_counts,
        "insight": insight
    }
