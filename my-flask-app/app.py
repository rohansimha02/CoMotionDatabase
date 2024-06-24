from flask import Flask, request, jsonify
import requests
import base64

app = Flask(__name__)

def encode_credentials(email, password):
    credentials = f"{email}:{password}"
    encoded = base64.b64encode(credentials.encode()).decode('utf-8').replace('\n', '')  # Proper encoding without newlines
    return {"Authorization": f"Basic {encoded}"}

@app.route('/login', methods=['POST'])
def login():
    email = request.json['email']
    password = request.json['password']
    headers = encode_credentials(email, password)
    url = "https://comotionlabsflukehall.spaces.nexudus.com/api/sys/businesses"  # Adjusted to your Nexudus domain
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return jsonify({"message": "Login successful", "data": response.json()}), 200
    else:
        return jsonify({"error": "Login failed"}), response.status_code

@app.route('/get-invoices', methods=['GET'])
def get_invoices():
    email = request.args.get('email')
    password = request.args.get('password')
    team_name = request.args.get('team_name')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    headers = encode_credentials(email, password)
    url = f"https://comotionlabsflukehall.spaces.nexudus.com/api/billing/invoices?page=1&size=25&Invoice_BillToName={team_name}&from_Invoice_InvoiceFromDate={start_date}T00%3A00%3A00&to_Invoice_InvoiceFromDate={end_date}T23%3A59%3A59&from_Invoice_InvoiceToDate={start_date}T00%3A00%3A00&to_Invoice_InvoiceToDate={end_date}T23%3A59%3A59"
    response = requests.get(url, headers=headers)
    return jsonify(response.json()) if response.status_code == 200 else jsonify({'error': 'Failed to fetch invoices'}), response.status_code

if __name__ == '__main__':
    app.run(debug=True)
