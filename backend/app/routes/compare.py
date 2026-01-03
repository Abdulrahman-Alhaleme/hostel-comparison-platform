from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from app.database import db
from bson import ObjectId
from groq import AsyncGroq
from app.config import settings
from app.routes.auth import get_current_user

router = APIRouter()

class CompareRequest(BaseModel):
    hostel_ids: List[str]

class CompareResponse(BaseModel):
    recommendation: str
    analysis: str
    comparison_table: List[Dict[str, Any]] = []
    hostel_names: List[str] = []

@router.post("/", response_model=CompareResponse)
async def compare_hostels(request: CompareRequest, current_user: dict = Depends(get_current_user)):
    if len(request.hostel_ids) != 2:
        raise HTTPException(status_code=400, detail="Please select exactly two hostels to compare.")
    
    # جلب بيوت الشباب
    hostel1 = await db.hostels.find_one({"_id": ObjectId(request.hostel_ids[0])})
    hostel2 = await db.hostels.find_one({"_id": ObjectId(request.hostel_ids[1])})
    
    if not hostel1 or not hostel2:
        raise HTTPException(status_code=404, detail="One or both hostels not found.")
        
    # بناء موجه الذكاء الاصطناعي
    prompt = f"""
    You are an AI travel assistant specializing in hostels. Compare the following two hostels.

    Hostel 1: {hostel1.get('name')}
    Data:
    - Price: ${hostel1.get('price_per_night')}
    - Rating: {hostel1.get('rating')}/10
    - Facilities: {', '.join(hostel1.get('facilities', []))}
    - Description: {hostel1.get('description')}

    Hostel 2: {hostel2.get('name')}
    Data:
    - Price: ${hostel2.get('price_per_night')}
    - Rating: {hostel2.get('rating')}/10
    - Facilities: {', '.join(hostel2.get('facilities', []))}
    - Description: {hostel2.get('description')}

    Please provide a comparison in STRICT JSON format with the following structure:
    {{
        "recommendation": "A short summary recommendation statement.",
        "comparison_table": [
            {{
                "feature": "Name of feature or advantage (e.g., 'Cheaper Price', 'Better Rating', 'Free Wifi')",
                "hostel1_has": true/false (true if Hotel 1 is better or has the feature),
                "hostel2_has": true/false (true if Hotel 2 is better or has the feature),
                "details": "Short explanation (e.g., '$50 vs $75')"
            }}
        ],
        "detailed_analysis": "A detailed text analysis explaining the differences."
    }}
    Create at least 5-6 comparison points covering Price, Rating, Cleanliness, Location (infer), Facilities, and Atmosphere.
    Ensure strict JSON output. Do not include markdown code blocks (```json) or introductory text. Just the JSON string.
    """
    
    try:
        # تهيئة عميل Groq
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
        
        try:
            data = json.loads(analysis_json)
            recommendation = data.get("recommendation", "Check analysis details.")
            detailed_analysis = data.get("detailed_analysis", "")
            comparison_table = data.get("comparison_table", [])
            
            # الحفظ في قاعدة البيانات
            comparison_doc = {
                "user_id": current_user["_id"],
                "hostel_ids": [hostel1["_id"], hostel2["_id"]],
                "hostel_names": [hostel1["name"], hostel2["name"]],
                "recommendation": recommendation,
                "analysis": detailed_analysis,
                "comparison_table": comparison_table,
                "created_at": datetime.utcnow()
            }
            await db.comparisons.insert_one(comparison_doc)

            return CompareResponse(
                recommendation=recommendation, 
                analysis=detailed_analysis,
                comparison_table=comparison_table,
                hostel_names=[hostel1["name"], hostel2["name"]]
            )
        except json.JSONDecodeError:
            print("Failed to parse JSON response")
            return CompareResponse(
                recommendation="Analysis Available", 
                analysis=analysis_json,
                comparison_table=[]
            )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        print(f"AI Error Detailed: {error_msg}")
        
        # استجابة وهمية احتياطية
        mock_analysis = f"""
        (Unable to connect to AI Service. Error: {error_msg})
        
        **Comparison Analysis (Fallback):**
        
        **Price:** {hostel1.get('name')} is priced at ${hostel1.get('price_per_night')}, while {hostel2.get('name')} is ${hostel2.get('price_per_night')}. 
        
        **Rating:** {hostel1.get('name')} has a rating of {hostel1.get('rating')}, whereas {hostel2.get('name')} has {hostel2.get('rating')}.
        """

        return CompareResponse(
            recommendation="AI Unavailable", 
            analysis=mock_analysis,
            comparison_table=[]
        )

class ComparisonHistoryItem(BaseModel):
    id: str
    hostel_names: List[str]
    recommendation: str
    created_at: datetime

@router.get("/history", response_model=List[ComparisonHistoryItem])
async def get_comparison_history(current_user: dict = Depends(get_current_user)):
    cursor = db.comparisons.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(10)
    history = await cursor.to_list(length=10)
    
    return [
        ComparisonHistoryItem(
            id=str(item["_id"]),
            hostel_names=item.get("hostel_names", []),
            recommendation=item.get("recommendation", "No recommendation"),
            created_at=item.get("created_at")
        )
        for item in history
    ]

@router.get("/{id}", response_model=CompareResponse)
async def get_comparison_detail(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    comparison = await db.comparisons.find_one({
        "_id": ObjectId(id),
        "user_id": current_user["_id"]
    })
    
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")
        
    return CompareResponse(
        recommendation=comparison.get("recommendation", ""),
        analysis=comparison.get("analysis", ""),
        comparison_table=comparison.get("comparison_table", []),
        hostel_names=comparison.get("hostel_names", ["Hostel 1", "Hostel 2"])
    )

@router.delete("/{id}")
async def delete_comparison(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.comparisons.delete_one({
        "_id": ObjectId(id),
        "user_id": current_user["_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comparison not found")
        
    return {"message": "Comparison deleted successfully"}
