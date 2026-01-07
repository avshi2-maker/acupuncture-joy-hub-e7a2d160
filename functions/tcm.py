import os
import json
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
MODEL_NAME = 'gemini-3-flash-preview'

def handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }
    
    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        params = event.get('queryStringParameters', {})
        question = params.get('question')
        
        if not question:
            return {'statusCode': 400, 'headers': headers, 'body': 'No question'}

        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(f"You are a TCM expert. Answer strictly in Chinese Medical terms. Question: {question}")

        return {
            'statusCode': 200, 
            'headers': headers, 
            'body': json.dumps({"answer": response.text})
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': str(e)}
