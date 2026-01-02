from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated
from bson import ObjectId

# Pydantic V2 Compatible ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class HostelBase(BaseModel):
    name: str
    country: str
    city: str
    price_per_night: float
    rating: float
    facilities: List[str]
    description: str
    image_url: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    website: Optional[str] = None
    attractions: Optional[str] = None
    pin_code: Optional[str] = None

class HostelCreate(HostelBase):
    pass

class HostelDB(HostelBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class HostelResponse(HostelBase):
    id: str
