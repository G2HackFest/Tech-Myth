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

    return {"summary": summary, "bias": bias, "context": text}  # Store original text for chat context

def chat_with_ai(query, context):
    model = genai.GenerativeModel("gemini-1.5-pro")
    
    # Use document context to answer user queries
    response = model.generate_content(f"Based on this legal document: {context}\n\nUser's question: {query}\nProvide a clear and concise response.")
    
    return response.text
