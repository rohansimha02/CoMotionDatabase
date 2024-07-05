"""
CoMotion Financial Reports Automation - Flask Backend

This Flask application serves as the backend API for the CoMotion startup incubator
financial reporting system. It interfaces with the Nexudus API to fetch billing
data and generate Excel reports for startup companies.

Author: Rohan Simha
Created for: CoMotion Startup Incubator
"""

import base64
import requests
import logging
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
from io import BytesIO
from datetime import datetime
import calendar

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Nexudus API base URL for CoMotion workspace management
BASE_URL = 'https://spaces.nexudus.com/api/'

def encode_auth(username, password):
    """
    Encode user credentials for HTTP Basic Authentication.
    
    Args:
        username (str): User's email/username for Nexudus
        password (str): User's password for Nexudus
        
    Returns:
        str: Base64 encoded authentication header string
    """
    credentials = f"{username}:{password}"
    base64_credentials = base64.b64encode(credentials.encode()).decode()
    return f"Basic {base64_credentials}"

@app.route('/login', methods=['POST'])
def login():
    """
    Authenticate user credentials against Nexudus API.
    
    Expected JSON payload:
        {
            "email": "user@example.com",
            "password": "userpassword"
        }
    
    Returns:
        JSON response with success/error message and HTTP status code
    """
    try:
        username = request.json.get('email')
        password = request.json.get('password')
        
        # Validate input credentials
        is_valid, error_msg = validate_credentials(username, password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Create authorization header for API request
        headers = {'Authorization': encode_auth(username, password)}
        
        # Test authentication by making a simple API call
        response = requests.get(f'{BASE_URL}spaces/teams', 
                              headers=headers, 
                              params={'page': 1, 'size': 1},
                              timeout=10)
        
        if response.ok:
            logger.info(f"Successful login for user: {username}")
            return jsonify({'message': 'Login successful'}), 200
        else:
            logger.warning(f"Failed login attempt for user: {username}")
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Connection timeout. Please try again.'}), 500
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Unable to connect to authentication service.'}), 500
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred during login.'}), 500

@app.route('/get_teams', methods=['GET'])
def get_teams():
    """
    Retrieve all teams/companies from the CoMotion Nexudus workspace.
    
    Expected headers:
        username: User's email/username
        password: User's password
    
    Returns:
        JSON response containing list of teams with their details
    """
    try:
        username = request.headers.get('username')
        password = request.headers.get('password')
        
        # Validate credentials
        is_valid, error_msg = validate_credentials(username, password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Create authorization header for API request
        headers = {'Authorization': encode_auth(username, password)}
        
        # Fetch teams with pagination (up to 100 teams, sorted ascending)
        response = requests.get(f'{BASE_URL}spaces/teams', 
                              headers=headers,
                              params={'page': 1, 'size': 100, 'dir': 'Ascending'},
                              timeout=10)
        
        if response.ok:
            teams_data = response.json()
            logger.info(f"Retrieved {len(teams_data.get('Records', []))} teams")
            return jsonify(teams_data), 200
        else:
            logger.error(f"Failed to retrieve teams: {response.status_code}")
            return jsonify({'error': 'Failed to retrieve teams'}), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Connection timeout. Please try again.'}), 500
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Unable to connect to the service.'}), 500
    except Exception as e:
        logger.error(f"Get teams error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred.'}), 500

@app.route('/get_invoices', methods=['POST'])
def get_invoices():
    """
    Fetch invoice data for a specific team across multiple time periods.
    
    Expected JSON payload:
        {
            "email": "user@example.com",
            "password": "userpassword",
            "team_name": "Startup Company Name",
            "months": [
                {"month": 1, "year": 2023},
                {"month": 2, "year": 2023}
            ]
        }
    
    Returns:
        JSON response with all invoices found for the specified periods
    """
    username = request.json.get('email')
    password = request.json.get('password')
    team_name = request.json.get('team_name')
    months = request.json.get('months')

    headers = {'Authorization': encode_auth(username, password)}

    # Validate credentials format
    is_valid, error_message = validate_credentials(username, password)
    if not is_valid:
        return jsonify({'error': error_message}), 400

    # Validate month/year inputs
    is_valid, error_message = validate_date_inputs(months)
    if not is_valid:
        return jsonify({'error': error_message}), 400

    # Fetch invoices for the specified periods
    success, result = fetch_invoices_for_periods(headers, team_name, months)
    if not success:
        return jsonify({'error': result}), 400

    return jsonify({'message': 'Invoices retrieved successfully', 'data': result}), 200

@app.route('/generate_excel', methods=['POST'])
def generate_excel():
    """
    Generate and download an Excel file containing invoice data for specified periods.
    
    This endpoint fetches invoice data (similar to /get_invoices) and formats it
    into an Excel spreadsheet for download.
    
    Expected JSON payload:
        {
            "email": "user@example.com",
            "password": "userpassword", 
            "team_name": "Startup Company Name",
            "months": [
                {"month": 1, "year": 2023},
                {"month": 2, "year": 2023}
            ]
        }
    
    Returns:
        Excel file as attachment download
    """
    try:
        username = request.json.get('email')
        password = request.json.get('password')
        team_name = request.json.get('team_name')
        months = request.json.get('months')

        # Validate credentials
        is_valid, error_msg = validate_credentials(username, password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Validate team name
        if not team_name:
            return jsonify({'error': 'Team name is required'}), 400

        # Validate date inputs
        is_valid, error_msg = validate_date_inputs(months)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        headers = {'Authorization': encode_auth(username, password)}

        # Fetch invoice data using shared function
        success, result = fetch_invoices_for_periods(headers, team_name, months)
        if not success:
            return jsonify({'error': result}), 500

        if not result:
            return jsonify({'error': 'No invoices found for the selected periods'}), 404

        # Convert invoice data to pandas DataFrame for Excel processing
        df = pd.DataFrame(result)
        
        # Select and rename relevant columns for better readability
        if not df.empty:
            column_mapping = {
                'RecordID': 'Invoice ID',
                'Invoice_BillToName': 'Company Name',
                'Invoice_InvoiceFromDate': 'Invoice From Date',
                'Invoice_InvoiceToDate': 'Invoice To Date',
                'Invoice_TotalGrossAmount': 'Gross Amount',
                'Invoice_Reference': 'Reference'
            }
            
            # Select only available columns
            available_columns = [col for col in column_mapping.keys() if col in df.columns]
            df_selected = df[available_columns].copy()
            df_selected.rename(columns=column_mapping, inplace=True)
        
        # Create Excel file in memory with improved formatting
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df_selected.to_excel(writer, index=False, sheet_name='Invoice Report')
            
            # Get workbook and worksheet for formatting
            workbook = writer.book
            worksheet = writer.sheets['Invoice Report']
            
            # Add formatting
            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#D7E4BC',
                'border': 1
            })
            
            # Apply header formatting
            for col_num, value in enumerate(df_selected.columns.values):
                worksheet.write(0, col_num, value, header_format)
                worksheet.set_column(col_num, col_num, 15)  # Set column width
        
        output.seek(0)  # Reset buffer position to beginning
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"invoices_{team_name}_{timestamp}.xlsx"
        
        logger.info(f"Generated Excel file for {team_name} with {len(result)} invoices")
        
        # Return Excel file as downloadable attachment
        return send_file(
            output, 
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except Exception as e:
        logger.error(f"Excel generation error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while generating the Excel file.'}), 500

def validate_credentials(username, password):
    """
    Validate that credentials are provided and properly formatted.
    
    Args:
        username (str): User's email/username
        password (str): User's password
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not username or not password:
        return False, "Email and password are required"
    
    if '@' not in username:
        return False, "Please provide a valid email address"
    
    return True, ""

def validate_date_inputs(months):
    """
    Validate month/year inputs for invoice requests.
    
    Args:
        months (list): List of month/year dictionaries
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if not months or len(months) == 0:
        return False, "At least one month/year selection is required"
    
    for date in months:
        month = date.get('month')
        year = date.get('year')
        
        # Check if month and year are provided
        if not month or not year:
            return False, "All month and year fields must be filled"
        
        # Validate month range
        try:
            month_int = int(month)
            if month_int < 1 or month_int > 12:
                return False, "Month must be between 1 and 12"
        except (ValueError, TypeError):
            return False, "Month must be a valid number"
        
        # Validate year range
        try:
            year_int = int(year)
            current_year = datetime.now().year
            if year_int < 2020 or year_int > current_year + 1:
                return False, f"Year must be between 2020 and {current_year + 1}"
        except (ValueError, TypeError):
            return False, "Year must be a valid number"
    
    return True, ""

def get_month_date_range(month, year):
    """
    Get the start and end dates for a given month/year.
    
    Args:
        month (int): Month (1-12)
        year (int): Year
        
    Returns:
        tuple: (start_date: str, end_date: str) in YYYY-MM-DD format
    """
    # Get the last day of the month to handle varying month lengths
    last_day = calendar.monthrange(year, month)[1]
    start_date = f"{year}-{month:02d}-01"
    end_date = f"{year}-{month:02d}-{last_day}"
    return start_date, end_date

def fetch_invoices_for_periods(headers, team_name, months):
    """
    Fetch invoices for multiple time periods (shared between endpoints).
    
    Args:
        headers (dict): Authorization headers for API requests
        team_name (str): Name of the team/company
        months (list): List of month/year dictionaries
        
    Returns:
        tuple: (success: bool, data: list or error_message: str)
    """
    all_invoices = []
    
    try:
        for date in months:
            month = int(date['month'])
            year = int(date['year'])
            
            start_date, end_date = get_month_date_range(month, year)
            
            # Build API URL with filters for team name and date range
            url = f"{BASE_URL}billing/invoices"
            params = {
                'page': 1,
                'size': 25,
                'Invoice_BillToName': team_name,
                f'from_Invoice_InvoiceFromDate': f"{start_date}T00:00:00",
                f'to_Invoice_InvoiceToDate': f"{end_date}T23:59:59"
            }
            
            logger.info(f"Fetching invoices for {team_name}, {month}/{year}")
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.ok:
                invoice_data = response.json().get('Records', [])
                all_invoices.extend(invoice_data)
                logger.info(f"Found {len(invoice_data)} invoices for {month}/{year}")
            else:
                logger.error(f"API error for {month}/{year}: {response.status_code}")
                return False, f"Failed to fetch invoices for {month}/{year}: {response.text}"
        
        return True, all_invoices
        
    except requests.exceptions.Timeout:
        return False, "Request timed out. Please try again."
    except requests.exceptions.ConnectionError:
        return False, "Unable to connect to the API. Please check your internet connection."
    except Exception as e:
        logger.error(f"Unexpected error in fetch_invoices_for_periods: {str(e)}")
        return False, f"An unexpected error occurred: {str(e)}"

if __name__ == '__main__':
    # Run Flask development server with debug mode enabled
    # In production, this should be run through a WSGI server like Gunicorn
    app.run(debug=True)
