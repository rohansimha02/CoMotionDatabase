#!/bin/bash

# CoMotion Financial Reports - Setup Script
# This script sets up the development environment for the CoMotion financial reporting system

echo "🚀 Setting up CoMotion Financial Reports..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 14 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Python backend
echo "📦 Setting up Python backend..."
cd my-flask-app

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Python backend setup complete"

# Setup React frontend
echo "📦 Setting up React frontend..."
cd ../comotion

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ React frontend setup complete"

# Return to root directory
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the Flask backend:"
echo "   cd my-flask-app && source venv/bin/activate && python app.py"
echo ""
echo "2. In a new terminal, start the React frontend:"
echo "   cd comotion && npm start"
echo ""
echo "The application will be available at http://localhost:3000"
