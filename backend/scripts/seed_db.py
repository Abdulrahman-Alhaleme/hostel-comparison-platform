import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

hostels = [
    {
        "name": "The backpacker's Haven",
        "country": "Thailand",
        "city": "Bangkok",
        "price_per_night": 15.0,
        "rating": 9.2,
        "facilities": ["Free WiFi", "Pool", "Bar", "Air Conditioning"],
        "description": "A lively hostel in the heart of Bangkok with a great social vibe and rooftop pool. Perfect for solo travelers."
    },
    {
        "name": "Cozy Corner Hostel",
        "country": "Vietnam",
        "city": "Hanoi",
        "price_per_night": 12.0,
        "rating": 8.8,
        "facilities": ["Free Breakfast", "City Tours", "Lounge"],
        "description": "A quiet and cozy place to relax after exploring the chaotic streets of Hanoi. Family dinner every night."
    },
    {
        "name": "Surf & Sand Hostel",
        "country": "Portugal",
        "city": "Lisbon",
        "price_per_night": 25.0,
        "rating": 9.5,
        "facilities": ["Surf Lessons", "Bar", "Kitchen", "Terrace"],
        "description": "Located near the beach, this hostel offers surf lessons and sunset parties. Very modern facilities."
    },
    {
        "name": "Mountain View Lodge",
        "country": "Switzerland",
        "city": "Interlaken",
        "price_per_night": 40.0,
        "rating": 9.0,
        "facilities": ["Ski Storage", "Sauna", "Common Room"],
        "description": "Breathtaking views of the Alps. A bit pricey but worth it for the amenities and location."
    }
]

async def seed():
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DB_NAME]
    
    # Clear existing
    await db.hostels.delete_many({})
    
    # Insert new
    result = await db.hostels.insert_many(hostels)
    print(f"Inserted {len(result.inserted_ids)} hostels.")
    
    client.close()

if __name__ == "__main__":
    # Need to add parent dir to path to import app
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    asyncio.run(seed())
