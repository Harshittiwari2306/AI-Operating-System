from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models, auth
from app.services.speech_service import SpeechCommandInterpreter

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

class VoiceTranscriptRequest(BaseModel):
    transcript: str

@router.post("/command")
def process_voice_command(
    req: VoiceTranscriptRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript is empty")
        
    # Interpret command
    interpretation = SpeechCommandInterpreter.interpret(req.transcript)
    
    # Save system log of voice command
    log = models.SystemLog(
        user_id=current_user.id,
        action="VOICE_COMMAND",
        details=f"Spoken: \"{req.transcript}\" -> Action: {interpretation['action']}"
    )
    db.add(log)
    db.commit()
    
    return interpretation
