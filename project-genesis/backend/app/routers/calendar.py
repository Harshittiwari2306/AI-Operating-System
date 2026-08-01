from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/calendar", tags=["Calendar Events"])

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event_in: schemas.EventCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Check for conflict first (optional flag or auto-check)
    new_event = models.CalendarEvent(
        user_id=current_user.id,
        title=event_in.title,
        description=event_in.description,
        start_time=event_in.start_time,
        end_time=event_in.end_time,
        is_ai_scheduled=False
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/", response_model=List[schemas.EventResponse])
def get_events(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.CalendarEvent).filter(models.CalendarEvent.user_id == current_user.id).all()

@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: int, event_in: schemas.EventUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    event = db.query(models.CalendarEvent).filter(
        models.CalendarEvent.id == event_id,
        models.CalendarEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event_in.title is not None:
        event.title = event_in.title
    if event_in.description is not None:
        event.description = event_in.description
    if event_in.start_time is not None:
        event.start_time = event_in.start_time
    if event_in.end_time is not None:
        event.end_time = event_in.end_time
        
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    event = db.query(models.CalendarEvent).filter(
        models.CalendarEvent.id == event_id,
        models.CalendarEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return None

@router.post("/suggest-time")
def suggest_time(event_in: schemas.EventCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Validates calendar conflicts and proposes optimized reschedule times if needed."""
    conflicts = db.query(models.CalendarEvent).filter(
        models.CalendarEvent.user_id == current_user.id,
        models.CalendarEvent.start_time < event_in.end_time,
        models.CalendarEvent.end_time > event_in.start_time
    ).all()
    
    if not conflicts:
        return {
            "conflict_detected": False,
            "message": "Time slot is clear! No conflicts detected.",
            "suggested_start": event_in.start_time,
            "suggested_end": event_in.end_time
        }
        
    # Overlap found! Find next available slot
    # Find max end time of conflicting event and add 5 minutes buffer
    latest_conflict_end = max([c.end_time for c in conflicts])
    duration = event_in.end_time - event_in.start_time
    
    suggested_start = latest_conflict_end + timedelta(minutes=5)
    suggested_end = suggested_start + duration
    
    return {
        "conflict_detected": True,
        "message": f"Conflict detected with {len(conflicts)} event(s). We suggest shifting the event to start right after.",
        "suggested_start": suggested_start,
        "suggested_end": suggested_end
    }
