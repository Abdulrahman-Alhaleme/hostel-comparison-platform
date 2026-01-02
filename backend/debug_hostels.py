import asyncio
import httpx
import json

async def test_get_hostels():
    url = "http://127.0.0.1:8000/api/hostels/"
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"Sending request to {url}")
            response = await client.get(url)
            print(f"Status Code: {response.status_code}")
            items = response.json()
            if items and len(items) > 0:
                print("First item keys:", items[0].keys())
                print("First item sample:", items[0])
            else:
                print("No items returned")
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_get_hostels())
