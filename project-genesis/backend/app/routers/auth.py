from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -----------------------------
# SIGNUP
# -----------------------------
@router.post(
    "/signup",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    try:
        print("=" * 60)
        print("SIGNUP STARTED")

        # Check existing email
        db_user = (
            db.query(models.User)
            .filter(models.User.email == user_in.email)
            .first()
        )

        print("STEP 1 - Email checked")

        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered.",
            )

        # Hash password
        hashed_password = auth.get_password_hash(user_in.password)

        print("STEP 2 - Password hashed")

        # First user becomes admin
        user_count = db.query(models.User).count()
        role = "admin" if user_count == 0 else "user"

        print("STEP 3 - Role assigned")

        new_user = models.User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            interests=user_in.interests,
            daily_hours_goal=user_in.daily_hours_goal,
            role=role,
        )

        print("STEP 4 - User object created")

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("STEP 5 - User saved")

        # Log signup
        log = models.SystemLog(
            user_id=new_user.id,
            action="SIGNUP",
            details=f"User signed up: {new_user.email}",
        )

        db.add(log)
        db.commit()

        print("STEP 6 - Log saved")
        print("SIGNUP SUCCESS")
        print("=" * 60)

        return new_user

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        print("=" * 60)
        print("SIGNUP ERROR")
        print(type(e).__name__)
        print(str(e))
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {str(e)}"
        )


# -----------------------------
# LOGIN
# -----------------------------
@router.post(
    "/login",
    response_model=schemas.Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not auth.verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = auth.create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
        }
    )

    try:
        log = models.SystemLog(
            user_id=user.id,
            action="LOGIN",
            details="User logged in successfully",
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# -----------------------------
# FORGOT PASSWORD
# -----------------------------
@router.post("/forgot-password")
def forgot_password(
    req: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == req.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account associated with this email.",
        )

    return {
        "message": "Password reset simulated successfully."
    }


# -----------------------------
# PROFILE
# -----------------------------
@router.get(
    "/profile",
    response_model=schemas.UserResponse,
)
def get_profile(
    current_user: models.User = Depends(auth.get_current_user),
):
    return current_user


# -----------------------------
# UPDATE PROFILE
# -----------------------------
@router.put(
    "/profile",
    response_model=schemas.UserResponse,
)
def update_profile(
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name

    if user_in.interests is not None:
        current_user.interests = user_in.interests

    if user_in.daily_hours_goal is not None:
        current_user.daily_hours_goal = user_in.daily_hours_goal

    if user_in.password is not None:
        current_user.hashed_password = auth.get_password_hash(
            user_in.password
        )

    db.commit()
    db.refresh(current_user)

    return current_user