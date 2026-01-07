import os
import json
import google.generativeai as genai

def handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }

    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        # Check Key
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            return {'statusCode': 500, 'headers': headers, 'body': 'Missing API Key'}
        
        genai.configure(api_key=key)

        # Get Question
        params = event.get('queryStringParameters', {})
        question = params.get('question', 'Hello')

        # Ask AI
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content(f"Answer strictly in TCM terms: {question}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"answer": response.text})
        }

    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': str(e)}
