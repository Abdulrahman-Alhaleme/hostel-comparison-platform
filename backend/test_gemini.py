import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env variables directly from the file to be sure
load_dotenv("backend/.env")

api_key = os.getenv("GEMINI_API_KEY")
print(f"Loaded API Key: {api_key}")

if not api_key:
    print("Error: No API Key found in .env")
    exit(1)

genai.configure(api_key=api_key)

try:
    print("Listing available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
            
    print("\nAttempting to connect to Gemini with gemini-2.0-flash...")
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Hello, can you hear me?")
    print("Success! Gemini responded:")
    print(response.text)
except Exception as e:
    print(f"Failed to connect: {e}")
