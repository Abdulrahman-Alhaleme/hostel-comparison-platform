
import requests
import json

def test_register():
    url = "http://localhost:8000/api/auth/register"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "username": "testuser_debug",
        "email": "testuser_debug@example.com",
        "password": "Password123!"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_register()
