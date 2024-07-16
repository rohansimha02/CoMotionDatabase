import base64
import requests
from flask import Flask, request, jsonify, send_file
import pandas as pd
from io import BytesIO

app = Flask(__name__)
BASE_URL = 'https://spaces.nexudus.com/api/'

def encode_auth(username, password):
    credentials = f"{username}:{password}"
    base64_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {base64_credentials}"

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('email')
    password = request.json.get('password')
    headers = {'Authorization': encode_auth(username, password)}
    response = requests.get(f'{BASE_URL}spaces/teams?page=1&size=1', headers=headers)
    if response.ok:
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/get_teams', methods=['GET'])
def get_teams():
    username = request.headers.get('username')
    password = request.headers.get('password')
    headers = {'Authorization': encode_auth(username, password)}
    response = requests.get(f'{BASE_URL}spaces/teams?page=1&size=100&dir=Ascending', headers=headers)
    if response.ok:
        return jsonify(response.json()), 200
    return jsonify({'error': 'Failed to retrieve teams'}), 400

@app.route('/get_invoices', methods=['POST'])
def get_invoices():
    username = request.json.get('email')
    password = request.json.get('password')
    team_name = request.json.get('team_name')
    months = request.json.get('months')

    headers = {'Authorization': encode_auth(username, password)}
    all_invoices = []

    for date in months:
        month = date['month']
        year = date['year']
        start_date = f"{year}-{month:02d}-01"
        end_date = f"{year}-{month:02d}-28"
        url = f"{BASE_URL}billing/invoices?page=1&size=25&Invoice_BillToName={team_name}&from_Invoice_InvoiceFromDate={start_date}T00%3A00%3A00&to_Invoice_InvoiceToDate={end_date}T23%3A59%3A59"
        response = requests.get(url, headers=headers)
        if response.ok:
            all_invoices.extend(response.json().get('Records', []))

    return jsonify({'message': 'Invoices retrieved successfully', 'data': all_invoices}), 200

@app.route('/generate_excel', methods=['POST'])
def generate_excel():
    username = request.json.get('email')
    password = request.json.get('password')
    team_name = request.json.get('team_name')
    months = request.json.get('months')

    headers = {'Authorization': encode_auth(username, password)}
    all_invoices = []

    for date in months:
        month = date['month']
        year = date['year']
        start_date = f"{year}-{month:02d}-01"
        end_date = f"{year}-{month:02d}-28"
        url = f"{BASE_URL}billing/invoices?page=1&size=25&Invoice_BillToName={team_name}&from_Invoice_InvoiceFromDate={start_date}T00%3A00%3A00&to_Invoice_InvoiceToDate={end_date}T23%3A59%3A59"
        response = requests.get(url, headers=headers)
        if response.ok:
            all_invoices.extend(response.json().get('Records', []))

    df = pd.DataFrame(all_invoices)
    output = BytesIO()
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    df.to_excel(writer, index=False, sheet_name='Invoices')
    writer.save()
    output.seek(0)

    return send_file(output, attachment_filename='invoices.xlsx', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
