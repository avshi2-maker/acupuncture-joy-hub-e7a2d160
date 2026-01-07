import os
import json
import google.generativeai as genai

# Configure API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL_NAME = 'gemini-3-flash-preview'

def handler(event, context):
    # CORS Headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }

    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        # Get Question
        params = event.get('queryStringParameters', {})
        question = params.get('question')
        
        if not question and event.get('body'):
            try:
                body = json.loads(event['body'])
                question = body.get('question')
            except:
                pass

        if not question:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({"error": "No question provided"})}

        # AI Prompt
        prompt = f"You are an expert TCM Practitioner. Answer strictly in Chinese Medical terms (Pattern -> Principle -> Points). Question: {question}"

        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"answer": response.text})
        }

    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({"error": str(e)})}
