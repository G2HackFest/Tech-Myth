import google.generativeai as genai

genai.configure(api_key="AIzaSyDbLQ_SIcSRwlGSowk11hdcU9olTt1U9i4")  # Replace with actual API key

def analyze_document(text):
    model = genai.GenerativeModel("gemini-1.5-pro")
    
    # Generate summary
    response = model.generate_content(f"Summarize this legal document in 250-350 words: {text}")
    summary = response.text

    # Detect bias
    response = model.generate_content(f"Highlight any biased terms in this document and explain why: {text}")
    bias = response.text

    return {"summary": summary, "bias": bias}
