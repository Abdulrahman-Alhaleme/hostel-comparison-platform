from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import Optional, Annotated, Any
from bson import ObjectId

# Pydantic V2 Compatible ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    username: str

class UserDB(UserBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    username: str
    hashed_password: str
    is_verified: bool = False
    verification_token: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        # json_encoders is removed in v2, but str conversion usually handled by PyObjectId being str compatible now

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    username: str
    is_verified: bool = False

    class Config:
        from_attributes = True
        populate_by_name = True
