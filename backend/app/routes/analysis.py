from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import json
from app.database import db
from bson import ObjectId
from groq import AsyncGroq
from app.config import settings
from app.routes.auth import get_current_user

router = APIRouter()

class AnalysisRequest(BaseModel):
    hostel_id: str

class AnalysisResponse(BaseModel):
    summary: str
    pros: List[str]
    cons: List[str]

@router.post("/hostel", response_model=AnalysisResponse)
async def analyze_single_hostel(request: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(request.hostel_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    hostel = await db.hostels.find_one({"_id": ObjectId(request.hostel_id)})
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")
        
    # بناء موجه الذكاء الاصطناعي
    prompt = f"""
    You are an AI travel assistant. Analyze the following hostel and provide a summary, list of advantages (pros), and list of disadvantages (cons).

    Hostel: {hostel.get('name')}
    Price: ${hostel.get('price_per_night')}
    Rating: {hostel.get('rating')}/10
    Facilities: {', '.join(hostel.get('facilities', []))}
    Description: {hostel.get('description')}
    Address: {hostel.get('address')}

    Please provide the output in STRICT JSON format with the following structure:
    {{
        "summary": "A 2-3 sentence summary of the hostel.",
        "pros": ["Advantage 1", "Advantage 2", "Advantage 3", "Advantage 4"],
        "cons": ["Disadvantage 1", "Disadvantage 2", "Disadvantage 3"]
    }}
    Base the pros and cons on the price, rating, facilities, and description.
    Ensure strict JSON output. Do not include markdown code blocks.
    """
    
    try:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        chat_completion = await client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that outputs strict JSON.",
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
        )
        
        analysis_json = chat_completion.choices[0].message.content
        data = json.loads(analysis_json)
        
        return AnalysisResponse(
            summary=data.get("summary", "No summary available."),
            pros=data.get("pros", []),
            cons=data.get("cons", [])
        )
        
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        # احتياطي
        return AnalysisResponse(
            summary="AI Analysis unavailable at the moment.",
            pros=["Price: $" + str(hostel.get('price_per_night')), "Rating: " + str(hostel.get('rating'))],
            cons=["Could not generate detailed analysis."]
        )
