import google.generativeai as genai
from config import Config

genai.configure(api_key=Config.GEMINI_API_KEY)

model = genai.GenerativeModel(model_name="gemini-1.5-pro")

def analyze_legal_text(text):
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(text)
    return response.text
