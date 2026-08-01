from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app import models, schemas, auth
from app.services.analysis_service import FinancePredictor

router = APIRouter(prefix="/finance", tags=["Finance Module"])

@router.post("/", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_transaction(
    expense_in: schemas.ExpenseCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    date_val = expense_in.date or datetime.utcnow()
    new_item = models.Expense(
        user_id=current_user.id,
        amount=expense_in.amount,
        type=expense_in.type,
        category=expense_in.category,
        description=expense_in.description,
        date=date_val
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    # Check if budget is approaching alerts
    # If the user logs an expense greater than $1000, trigger warning
    if expense_in.type == "expense" and expense_in.amount >= 1000:
        notif = models.Notification(
            user_id=current_user.id,
            title="Large Expense Logged",
            message=f"You just spent ${expense_in.amount:.2f} on {expense_in.category}. Please check your remaining budget.",
            type="Budget"
        )
        db.add(notif)
        db.commit()
        
    return new_item

@router.get("/", response_model=List[schemas.ExpenseResponse])
def get_transactions(
    category: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Expense).filter(models.Expense.user_id == current_user.id)
    if category:
        query = query.filter(models.Expense.category == category)
    return query.order_by(models.Expense.date.desc()).all()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    tx = db.query(models.Expense).filter(models.Expense.id == id, models.Expense.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return None

@router.get("/forecast")
def get_spending_forecast(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == current_user.id).all()
    expenses_dicts = [
        {"amount": e.amount, "type": e.type, "category": e.category, "date": e.date}
        for e in expenses
    ]
    
    forecast = FinancePredictor.forecast_expenses(expenses_dicts)
    
    # Calculate monthly income vs projected expense
    monthly_income = sum(e.amount for e in expenses if e.type == "income" and (datetime.utcnow() - e.date).days <= 30)
    
    # Trigger notification if deficit predicted
    predicted_exp = forecast["predicted_next_month"]
    
    if predicted_exp > 0 and monthly_income > 0 and predicted_exp > (monthly_income * 0.9):
        # Auto-create alert
        db_alert = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.title == "Budget Alert: Deficit Forecasted",
            models.Notification.is_read == False
        ).first()
        
        if not db_alert:
            alert = models.Notification(
                user_id=current_user.id,
                title="Budget Alert: Deficit Forecasted",
                message=f"Based on spending patterns, your next month's forecast (${predicted_exp:.2f}) represents over 90% of your monthly income.",
                type="Budget"
            )
            db.add(alert)
            db.commit()
            
    return {
        "forecast": forecast,
        "monthly_income": monthly_income,
        "alert_triggered": predicted_exp > monthly_income * 0.9 if monthly_income > 0 else False
    }
