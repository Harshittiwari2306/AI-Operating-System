from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/tasks", tags=["Tasks Management"])

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: schemas.TaskCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Predict due date: simple simulation based on priority (High = 1 day, Medium = 3 days, Low = 7 days)
    delta_days = 3
    if task_in.priority == "High":
        delta_days = 1
    elif task_in.priority == "Low":
        delta_days = 7
    predicted_due = datetime.datetime.utcnow() + datetime.timedelta(days=delta_days)
    
    new_task = models.Task(
        user_id=current_user.id,
        title=task_in.title,
        description=task_in.description,
        category=task_in.category or "General",
        priority=task_in.priority or "Medium",
        due_date=task_in.due_date,
        predicted_due_date=predicted_due
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(completed: Optional[bool] = None, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)
    if completed is not None:
        query = query.filter(models.Task.completed == completed)
    return query.all()

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task_in: schemas.TaskUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.category is not None:
        task.category = task_in.category
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.due_date is not None:
        task.due_date = task_in.due_date
    if task_in.completed is not None:
        task.completed = task_in.completed
        
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None

@router.get("/suggest-next", response_model=schemas.TaskResponse)
def suggest_next_task(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # AI suggestion: get uncompleted tasks and prioritize:
    # 1. High priority first
    # 2. Soonest due date
    tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.completed == False
    ).all()
    
    if not tasks:
        raise HTTPException(status_code=404, detail="No uncompleted tasks available. Relax or create a new task!")
        
    # Simple prioritization logic: high = weight 3, medium = 2, low = 1
    def get_weight(t):
        weight = 0
        if t.priority == "High":
            weight += 300
        elif t.priority == "Medium":
            weight += 200
        else:
            weight += 100
            
        if t.due_date:
            days_left = (t.due_date - datetime.datetime.utcnow()).days
            # Add weight inversely proportional to days remaining (closer = higher weight)
            weight += max(0, 100 - days_left * 5)
        return weight
        
    sorted_tasks = sorted(tasks, key=get_weight, reverse=True)
    return sorted_tasks[0]
