import asyncio
import csv
import os
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "hostel_db")

# Mapping star ratings to numbers
RATING_MAP = {
    "OneStar": 1.0,
    "TwoStar": 2.0,
    "ThreeStar": 3.0,
    "FourStar": 4.0,
    "FiveStar": 5.0,
    "All": 3.0 # Fallback
}

def parse_rating(rating_str):
    return RATING_MAP.get(rating_str, 0.0)

async def import_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    collection = db["hostels"]
    
    # Clear existing data
    print("Clearing existing data...")
    await collection.delete_many({})
    
    # Path to CSV
    # Path to CSV - Uses relative path from the script location
    # Assuming script is in backend/ and CSV is in root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    csv_path = os.path.join(project_root, "hotels_Data.csv")
    
    count = 0
    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        # Handle potential null bytes
        lines = (line.replace('\0', '') for line in f)
        reader = csv.DictReader(lines)
        
        # Clean headers (strip whitespace)
        if reader.fieldnames:
            reader.fieldnames = [name.strip() for name in reader.fieldnames]
        
        print(f"Detected columns (cleaned): {reader.fieldnames}")
        
        batch = []
        for row in reader:
            # Map Row to Model using cleaned keys
            # Expecting: countyName, cityName, HotelName, HotelRating, Address, Description
            
            raw_country = row.get('countyName', 'Unknown')
            # Normalize country
            if raw_country.strip() in ['United States', 'USA', 'US']:
                country = 'USA'
            elif raw_country.strip() in ['Canada', 'CA']:
                country = 'Canada'
            else:
                country = raw_country
            
            name = row.get('HotelName', 'Unknown Hotel')
            city = row.get('cityName', 'Unknown City')
            
            # Rating
            raw_rating = row.get('HotelRating', '')
            rating = parse_rating(raw_rating)
            if rating == 0:
                try: 
                     rating = float(raw_rating)
                except:
                     rating = 3.5
            
            # Price (Randomized)
            price = round(random.uniform(20.0, 150.0), 2)
            
            # Desc & Address
            desc = row.get('Description', '')
            address = row.get('Address', '')
            full_desc = desc # kept original description separate from address now
            
            # Facilities
            raw_facilities = row.get('HotelFacilities', '')
            if raw_facilities and raw_facilities.lower() != 'null':
                facilities = [f.strip() for f in raw_facilities.split(',') if f.strip()]
            else:
                facilities = ["Free WiFi", "24h Reception"]
                if "Pool" in desc: facilities.append("Pool")
                if "Gym" in desc or "Fitness" in desc: facilities.append("Gym")
                if "Breakfast" in desc: facilities.append("Free Breakfast")
            
            hostel_doc = {
                "name": name,
                "country": country,
                "city": city,
                "price_per_night": price,
                "rating": rating,
                "facilities": facilities,
                "description": full_desc[:5000],
                "image_url": None,
                "address": address,
                "phone_number": row.get('PhoneNumber', ''),
                "website": row.get('HotelWebsiteUrl', ''),
                "attractions": row.get('Attractions', ''),
                "pin_code": row.get('PinCode', '')
            }
            
            batch.append(hostel_doc)
            count += 1
            
            if len(batch) >= 100:
                await collection.insert_many(batch)
                batch = []
                print(f"Imported {count} hotels...")
        
        if batch:
            await collection.insert_many(batch)
            
    print(f"Finished! Total imported: {count}")

if __name__ == "__main__":
    asyncio.run(import_data())
