from fastapi import APIRouter, HTTPException
from typing import List
from app.database import db
from app.models.hostel import HostelDB, HostelCreate, HostelResponse
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[HostelResponse])
async def get_hostels(search: str = None, country: str = None, min_price: float = None, max_price: float = None, min_rating: float = None):
    query = {}
    if country:
        query["country"] = country
    if search:
        # Case-insensitive regex search on name
        query["name"] = {"$regex": search, "$options": "i"}
    
    if min_price is not None or max_price is not None:
        query["price_per_night"] = {}
        if min_price is not None:
            query["price_per_night"]["$gte"] = min_price
        if max_price is not None:
            query["price_per_night"]["$lte"] = max_price
            
    if min_rating is not None:
        query["rating"] = {"$gte": min_rating}

    # If a search/filter is active, we might want more results, but let's cap at 50 to be safe
    # If no search, just return top 20 to avoid overwhelming
    limit = 50 if search or country or min_price or max_price or min_rating else 20
    
    hostels = await db.hostels.find(query).to_list(limit)
    
    output = []
    for h in hostels:
        h_dict = h
        if "_id" in h_dict:
            h_dict["id"] = str(h_dict["_id"])
        output.append(h_dict)
    return output

@router.post("/", response_model=HostelResponse)
async def create_hostel(hostel: HostelCreate):
    new_hostel = await db.hostels.insert_one(hostel.model_dump())
    created_hostel = await db.hostels.find_one({"_id": new_hostel.inserted_id})
    return HostelResponse(**created_hostel, id=str(created_hostel["_id"]))

@router.get("/{hostel_id}", response_model=HostelResponse)
async def get_hostel(hostel_id: str):
    if not ObjectId.is_valid(hostel_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    hostel = await db.hostels.find_one({"_id": ObjectId(hostel_id)})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")
    return HostelResponse(**hostel, id=str(hostel["_id"]))
