from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import base64

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Nexudus API credentials
API_KEY = os.getenv('NEXUDUS_API_KEY')
API_SECRET = os.getenv('NEXUDUS_API_SECRET')

# Encode credentials for Basic Authentication using the specific method mentioned
credentials = f"{API_KEY}:{API_SECRET}"
base64string = base64.b64encode(credentials.encode()).decode('utf-8').replace('\n', '')
headers = {
    "Authorization": f"Basic {base64string}"
}

# Function to get invoices based on business ID, month, and year
@app.route('/get-invoices', methods=['GET'])
def get_invoices():
    business_id = request.args.get('business_id')
    year = request.args.get('year')
    month = request.args.get('month')
    
    url = f"https://spaces.nexudus.com/api/billing/invoices?year={year}&month={month}&Invoice_Business={business_id}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({'error': 'Failed to fetch data'}), response.status_code

# Function to search businesses by name
@app.route('/search-businesses', methods=['GET'])
def search_businesses():
    query = request.args.get('query')
    url = f"https://spaces.nexudus.com/api/sys/businesses?Business_Name={query}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({'error': 'Failed to fetch data'}), response.status_code

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
