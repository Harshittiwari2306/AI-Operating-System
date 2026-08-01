from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/notes", tags=["Notes Notebook"])

@router.post("/", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note_in: schemas.NoteCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    new_note = models.Note(
        user_id=current_user.id,
        title=note_in.title,
        content=note_in.content,
        tags=note_in.tags,
        image_url=note_in.image_url
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@router.get("/", response_model=List[schemas.NoteResponse])
def get_notes(search: Optional[str] = None, tag: Optional[str] = None, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.Note).filter(models.Note.user_id == current_user.id)
    
    if search:
        query = query.filter(
            (models.Note.title.ilike(f"%{search}%")) | 
            (models.Note.content.ilike(f"%{search}%"))
        )
        
    notes = query.all()
    
    # Filter by tag in python if needed (since SQLite JSON requires json_each or complex raw queries)
    if tag:
        tag_lower = tag.lower()
        notes = [n for n in notes if any(tag_lower == t.lower() for t in n.tags)]
        
    return notes

@router.get("/{note_id}", response_model=schemas.NoteResponse)
def get_note(note_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{note_id}", response_model=schemas.NoteResponse)
def update_note(note_id: int, note_in: schemas.NoteUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    if note_in.title is not None:
        note.title = note_in.title
    if note_in.content is not None:
        note.content = note_in.content
    if note_in.tags is not None:
        note.tags = note_in.tags
    if note_in.image_url is not None:
        note.image_url = note_in.image_url
        
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return None
