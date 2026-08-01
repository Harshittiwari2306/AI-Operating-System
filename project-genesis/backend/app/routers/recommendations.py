from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
from app.services.analysis_service import RecommendationEngine
from app.routers.productivity import get_productivity_score

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

@router.get("/", response_model=List[schemas.RecommendationResponse])
def get_recommendations(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate user's live productivity score
    prod_data = get_productivity_score(current_user, db)
    score = prod_data["productivity_score"]
    
    # Generate recommendations
    recs = RecommendationEngine.get_recommendations(
        interests=current_user.interests or [],
        recent_performance=score
    )
    
    # Store recommendations in database if they don't already exist to keep historical log
    # Clear older recommendations first
    db.query(models.Recommendation).filter(models.Recommendation.user_id == current_user.id).delete()
    
    db_recs = []
    for r in recs:
        db_rec = models.Recommendation(
            user_id=current_user.id,
            title=r["title"],
            description=r["description"],
            resource_type=r["resource_type"],
            url=r["url"],
            reasoning=r["reasoning"]
        )
        db.add(db_rec)
        db_recs.append(db_rec)
        
    db.commit()
    for r in db_recs:
        db.refresh(r)
        
    return db_recs
