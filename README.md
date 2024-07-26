# CoMotion Financial Reports Automation

## Project Overview

An automated financial reporting system built for CoMotion Startup Incubator to streamline the generation of startup invoice and billing reports. This tool integrates with Nexudus API to fetch financial data and generate reports for startups housed within the incubator.

**Real-world Impact**: This system was actively used at the CoMotion Startup Incubator to automate financial reporting processes, reducing manual data processing time from hours to minutes for incubator staff.

## Key Features

- **Secure Authentication**: Login system with credential validation
- **Team Management**: Dynamic team/company selection from CoMotion database
- **Multi-Period Reporting**: Select multiple months/years for comprehensive reports
- **Excel Export**: Automated generation of formatted Excel reports
- **Real-time Data**: Direct integration with Nexudus billing system
- **Responsive UI**: Clean, professional interface matching CoMotion branding

## Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **Bootstrap 5.3.3** - Responsive styling framework
- **Axios** - HTTP client for API communication
- **Custom CSS** - CoMotion brand-specific styling

### Backend
- **Flask** - Python web framework
- **Pandas** - Data processing and Excel generation
- **Requests** - HTTP library for external API calls
- **Base64** - Authentication encoding

### External Integration
- **Nexudus API** - Coworking space management platform

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- pip package manager
- npm package manager

### Backend Setup
1. Navigate to the Flask application directory:
   ```bash
   cd my-flask-app
   ```

2. Install Python dependencies:
   ```bash
   pip install flask pandas requests xlsxwriter
   ```

3. Start the Flask server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the React application directory:
   ```bash
   cd comotion
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Add axios dependency if not present:
   ```bash
   npm install axios
   ```

4. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## Usage Examples

### Basic Workflow
1. **Login**: Enter your Nexudus credentials to authenticate
2. **Select Team**: Choose the startup company from the dropdown
3. **Choose Time Period**: Select month(s) and year(s) for the report
4. **Generate Report**: Click "Generate File" to download Excel report

### Example API Endpoints
- `POST /login` - Authenticate user credentials
- `GET /get_teams` - Retrieve all teams/companies
- `POST /get_invoices` - Fetch invoice data for selected periods
- `POST /generate_excel` - Generate and download Excel report

### Sample Report Data
Generated Excel files include:
- Invoice ID and reference numbers
- Company/team names and billing information
- Invoice dates and billing periods
- Gross amounts and financial totals
- Detailed line items per invoice

## Project Structure
```
CoMotionDatabase/
├── my-flask-app/          # Python Flask backend
│   └── app.py            # Main Flask application
├── comotion/             # React frontend application
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── Login.js      # Authentication component
│   │   ├── InvoiceFetcher.js  # Invoice management component
│   │   └── styles.css    # Application styling
│   └── public/           # Static assets
├── css/                  # Legacy styling
├── img/                  # CoMotion branding assets
└── index.html           # Legacy HTML interface
```

---
