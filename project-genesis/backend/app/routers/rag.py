import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth
from app.config import settings
from app.services.ai_service import RAGService

router = APIRouter(prefix="/rag", tags=["Document Brain (RAG)"])

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Check extension
    filename = file.filename
    ext = os.path.splitext(filename)[1].replace(".", "").upper()
    if ext not in ["PDF", "DOCX", "TXT", "PPT", "PPTX"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload PDF, DOCX, TXT, or PPT/PPTX files."
        )
        
    # Save file locally
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}")
    os.makedirs(user_upload_dir, exist_ok=True)
    file_path = os.path.join(user_upload_dir, filename)
    
    # Write file content
    contents = await file.read()
    file_size = len(contents)
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    # Create file row in Database
    db_file = models.UploadedFile(
        user_id=current_user.id,
        filename=filename,
        file_type=ext,
        file_path=file_path,
        file_size=file_size
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    # Process and index file in background
    background_tasks.add_task(
        RAGService.process_and_index_file,
        user_id=current_user.id,
        file_id=db_file.id,
        file_path=file_path,
        file_type=ext
    )
    
    # Create System Log
    log = models.SystemLog(
        user_id=current_user.id,
        action="FILE_UPLOAD",
        details=f"Uploaded and started indexing: {filename} ({file_size} bytes)"
    )
    db.add(log)
    db.commit()
    
    return db_file

@router.get("/files", response_model=List[schemas.FileResponse])
def get_uploaded_files(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.UploadedFile).filter(models.UploadedFile.user_id == current_user.id).all()

@router.post("/query")
def query_rag(
    req: schemas.RagQueryRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify file ownership if file_id is provided
    if req.file_id is not None:
        db_file = db.query(models.UploadedFile).filter(
            models.UploadedFile.id == req.file_id,
            models.UploadedFile.user_id == current_user.id
        ).first()
        if not db_file:
            raise HTTPException(status_code=404, detail="Requested file not found in your Document Brain.")
            
    # Execute RAG query
    response_text = RAGService.query_document(
        user_id=current_user.id,
        file_id=req.file_id,
        query=req.query,
        mode=req.mode or "standard"
    )
    
    # Log search action
    log = models.SystemLog(
        user_id=current_user.id,
        action="RAG_QUERY",
        details=f"Queried vector DB (File ID: {req.file_id}): {req.query[:50]}"
    )
    db.add(log)
    db.commit()
    
    return {"response": response_text}

@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(file_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_file = db.query(models.UploadedFile).filter(
        models.UploadedFile.id == file_id,
        models.UploadedFile.user_id == current_user.id
    ).first()
    
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Remove local file
    if os.path.exists(db_file.file_path):
        try:
            os.remove(db_file.file_path)
        except Exception as e:
            print(f"Error removing local file: {e}")
            
    # Chroma delete collection chunks
    # ChromaDB supports deleting documents by metadata filters
    from app.services.ai_service import collection
    if collection:
        try:
            collection.delete(
                where={"file_id": file_id}
            )
        except Exception as e:
            print(f"Error deleting collection chunks from Chroma: {e}")
            
    # Delete from DB
    db.delete(db_file)
    db.commit()
    return None
