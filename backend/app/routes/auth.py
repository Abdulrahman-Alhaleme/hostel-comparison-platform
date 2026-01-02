from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
import uuid
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.database import db
from app.models.user import UserCreate, UserResponse, UserDB
from app.auth import get_password_hash, verify_password, create_access_token
from app.config import settings
from datetime import timedelta
from bson import ObjectId
from app.utils.email import send_email_background

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

from jose import jwt, JWTError

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid credential")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credential")
        
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, background_tasks: BackgroundTasks):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    # Ensure email is lowercase for uniqueness check consistency
    user_dict["email"] = user_dict["email"].lower()
    user_dict["username"] = user_dict["username"]
    
    # Generate verification token
    verification_token = str(uuid.uuid4())
    user_dict["verification_token"] = verification_token
    user_dict["is_verified"] = False
    
    new_user = await db.users.insert_one(user_dict)
    
    # Send verification email
    verify_link = f"http://localhost:8000/api/auth/verify/{verification_token}"
    email_body = f"""
    <h1>Welcome to Hostel Comparison Platform!</h1>
    <p>Please click the link below to verify your account:</p>
    <a href="{verify_link}">Verify Email</a>
    """
    background_tasks.add_task(send_email_background, user_dict["email"], "Verify your account", email_body)

    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    # Map _id to id explicitly for Pydantic if needed, or rely on alias
    return UserResponse(
        id=str(created_user["_id"]),
        username=created_user["username"],
        email=created_user["email"]
    )

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username}) # Assuming username field is used for email or username
    # If using email for login, adjust form_data handling
    if not user:
         # Try finding by email if username failed
        user = await db.users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"]
    )
@router.get("/verify/{token}")
async def verify_email(token: str):
    user = await db.users.find_one({"verification_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"is_verified": True, "verification_token": None}}
    )
    return {"message": "Email verified successfully. You can now login."}
