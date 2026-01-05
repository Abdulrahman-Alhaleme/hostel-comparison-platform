
import asyncio
import os
from app.database import get_database, db
from app.models.user import UserCreate
from app.auth import get_password_hash
from fastapi import BackgroundTasks
from app.routes.auth import register

# Mock BackgroundTasks
class MockBackgroundTasks:
    def add_task(self, func, *args, **kwargs):
        print(f"Mock adding task: {func.__name__}")
        # We can try to execute it to see if it crashes, though in real app it's later
        try:
            func(*args, **kwargs)
        except Exception as e:
            print(f"Task execution failed (would happen in background): {e}")

async def test_registration_logic():
    print("Testing registration logic...")
    
    # 1. Test Password Hashing
    try:
        print("Hashing password...")
        pw = "Password123!"
        hashed = get_password_hash(pw)
        print(f"Hash success: {hashed[:10]}...")
    except Exception as e:
        print(f"Hashing failed: {e}")
        return

    # 2. Test DB Connection
    try:
        print("Checking DB...")
        await get_database()
        print("DB ok.")
    except Exception as e:
        print(f"DB failed: {e}")
        return

    # 3. Simulate Register
    user_data = {
        "username": "debug_user_1",
        "email": "debug_user_1@test.com",
        "password": "Password123!"
    }
    user = UserCreate(**user_data)
    
    bg_tasks = MockBackgroundTasks()

    # We need to manually duplicate the logic because 'register' is a route handler 
    # and might be hard to call directly without full FastAPI context (Depends etc are resolved by FastAPI)
    # But we can call it if we pass arguments. 
    # 'register' expects (user, background_tasks).
    
    try:
        response = await register(user, bg_tasks)
        print("Registration function returned successfully!")
        print(response)
    except Exception as e:
        print(f"Registration function CRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_registration_logic())
