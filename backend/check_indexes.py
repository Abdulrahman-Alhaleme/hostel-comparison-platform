
import asyncio
from app.database import get_database

async def check_indexes():
    db = await get_database()
    indexes = await db.users.index_information()
    print("Indexes on users collection:")
    for name, info in indexes.items():
        print(f"{name}: {info}")

if __name__ == "__main__":
    asyncio.run(check_indexes())
