import json
import os
import google.generativeai as genai

def handler(event, context):
    # Headers for the browser
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    }

    # Handle "Pre-flight" check
    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        # 1. Get the Question
        params = event.get('queryStringParameters', {})
        question = params.get('question', 'Hello')

        # 2. Setup AI
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            return {'statusCode': 500, 'headers': headers, 'body': json.dumps({"error": "Missing API Key"})}
        
        genai.configure(api_key=key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # 3. Ask AI
        response = model.generate_content(f"You are a TCM Expert. Answer briefly: {question}")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"answer": response.text})
        }

    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({"error": str(e)})}
