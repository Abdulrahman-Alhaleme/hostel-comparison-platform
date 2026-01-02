import asyncio
import httpx
import json

async def test_register():
    url = "http://127.0.0.1:8000/api/auth/register"
    data = {
        "email": "debug_user@example.com",
        "username": "debug_user_1",
        "password": "DebugPassword123!"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"Sending request to {url} with data: {data}")
            response = await client.post(url, json=data)
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_register())
