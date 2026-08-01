from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models, auth
from app.services.ai_service import ChatAssistantAI

router = APIRouter(prefix="/chat", tags=["AI Chat Assistant"])

class ChatQueryRequest(BaseModel):
    query: str

@router.post("/")
def ask_chatbot(
    req: ChatQueryRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    # Get active tasks
    active_tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.completed == False
    ).limit(5).all()
    task_titles = [t.title for t in active_tasks]
    
    # Get recent notes
    recent_notes = db.query(models.Note).filter(
        models.Note.user_id == current_user.id
    ).order_by(models.Note.updated_at.desc()).limit(3).all()
    note_snippets = [f"{n.title}: {n.content[:150]}..." for n in recent_notes]
    
    # Prepare profile details
    user_profile = {
        "interests": current_user.interests,
        "daily_hours_goal": current_user.daily_hours_goal
    }
    
    # Generate answers
    answer = ChatAssistantAI.answer_query(
        user_profile=user_profile,
        query=req.query,
        context_notes=note_snippets,
        recent_tasks=task_titles
    )
    
    return {"answer": answer}
