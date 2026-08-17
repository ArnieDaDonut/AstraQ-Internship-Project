import os
from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents="What is the latest news on AI?",
        config=types.GenerateContentConfig(
            tools=[{"google_search": {}}]
        ),
    )
    print("Success")
    if hasattr(response, 'candidates') and response.candidates:
        grounding = response.candidates[0].grounding_metadata
        if grounding:
            print("Has grounding!")
except Exception as e:
    print(f"Error: {e}")
