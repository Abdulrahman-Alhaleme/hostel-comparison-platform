from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database import db
from bson import ObjectId
from groq import AsyncGroq
from app.config import settings

router = APIRouter()

class CompareRequest(BaseModel):
    hostel_ids: List[str]

class CompareResponse(BaseModel):
    recommendation: str
    analysis: str

@router.post("/", response_model=CompareResponse)
async def compare_hostels(request: CompareRequest):
    if len(request.hostel_ids) != 2:
        raise HTTPException(status_code=400, detail="Please select exactly two hostels to compare.")
    
    # Fetch hostels
    hostel1 = await db.hostels.find_one({"_id": ObjectId(request.hostel_ids[0])})
    hostel2 = await db.hostels.find_one({"_id": ObjectId(request.hostel_ids[1])})
    
    if not hostel1 or not hostel2:
        raise HTTPException(status_code=404, detail="One or both hostels not found.")
        
    # Construct AI Prompt
    prompt = f"""
    You are an AI travel assistant specializing in hostels. Compare the following two hostels and recommend the best one for a traveler.
    
    Hostel 1: {hostel1.get('name')} in {hostel1.get('city')}, {hostel1.get('country')}
    Price: ${hostel1.get('price_per_night')}
    Rating: {hostel1.get('rating')}/10
    Facilities: {', '.join(hostel1.get('facilities', []))}
    Description: {hostel1.get('description')}
    
    Hostel 2: {hostel2.get('name')} in {hostel2.get('city')}, {hostel2.get('country')}
    Price: ${hostel2.get('price_per_night')}
    Rating: {hostel2.get('rating')}/10
    Facilities: {', '.join(hostel2.get('facilities', []))}
    Description: {hostel2.get('description')}
    
    Please provide a detailed comparison based on price, rating, cleanliness (infer from description/rating), facilities, social atmosphere, and safety.
    Explain why one is better than the other.
    """
    
    try:
        # Initialize Groq Client
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        
        chat_completion = await client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        
        analysis = chat_completion.choices[0].message.content
        
        # Simple extraction for recommendation summary
        recommendation = "Check full analysis below."
        
        return CompareResponse(recommendation=recommendation, analysis=analysis)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        print(f"AI Error Detailed: {error_msg}")
        
        # Fallback Mock Response
        mock_analysis = f"""
        (Unable to connect to AI Service. Error: {error_msg})
        
        **Comparison Analysis (Fallback):**
        
        **Price:** {hostel1.get('name')} is priced at ${hostel1.get('price_per_night')}, while {hostel2.get('name')} is ${hostel2.get('price_per_night')}. 
        
        **Rating:** {hostel1.get('name')} has a rating of {hostel1.get('rating')}, whereas {hostel2.get('name')} has {hostel2.get('rating')}.
        """
        return CompareResponse(recommendation="AI Unavailable", analysis=mock_analysis)
