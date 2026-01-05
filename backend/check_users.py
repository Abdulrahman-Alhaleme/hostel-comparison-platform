
import asyncio
from app.database import get_database

async def check_user():
    db = await get_database()
    email = "ahmad@gmail.com"
    user = await db.users.find_one({"email": email})
    if user:
        print(f"User FOUND: {user.get('username')}, Email: {user.get('email')}")
    else:
        print(f"User {email} NOT FOUND")
        
    print("All emails:")
    async for u in db.users.find({}, {"email": 1, "_id": 0}):
        print(u.get("email"))

if __name__ == "__main__":
    asyncio.run(check_user())
