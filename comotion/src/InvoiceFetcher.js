/**
 * InvoiceFetcher Component - Main Invoice Management Interface
 * 
 * This component provides the core functionality for:
 * - Selecting teams/companies from CoMotion workspace
 * - Choosing multiple time periods for reporting
 * - Fetching and displaying invoice data
 * - Generating Excel reports for download
 * 
 * @author Rohan Simha
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceFetcher = ({ email, password, onLogout }) => {
    // State management for form inputs and data
    const [teamName, setTeamName] = useState('');
    const [selectedMonths, setSelectedMonths] = useState([{ month: '', year: '' }]);
    const [teams, setTeams] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Fetch available teams from the CoMotion workspace on component mount
     */
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('http://localhost:5000/get_teams', {
                    headers: {
                        username: email,
                        password: password
                    }
                });
                // Extract team records from API response
                setTeams(response.data.Records || []);
            } catch (error) {
                setError('Failed to load teams. Please refresh the page.');
                console.error('Failed to fetch teams:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch teams if credentials are available
        if (email && password) {
            fetchTeams();
        }
    }, [email, password]);

    /**
     * Validate form inputs before making API calls
     */
    const validateForm = () => {
        if (!teamName) {
            setError('Please select a team');
            return false;
        }
        
        for (let i = 0; i < selectedMonths.length; i++) {
            const { month, year } = selectedMonths[i];
            if (!month || !year) {
                setError(`Please fill in both month and year for selection ${i + 1}`);
                return false;
            }
            
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            
            if (monthNum < 1 || monthNum > 12) {
                setError('Month must be between 1 and 12');
                return false;
            }
            
            if (yearNum < 2020 || yearNum > new Date().getFullYear() + 1) {
                setError('Please enter a valid year');
                return false;
            }
        }
        
        return true;
    };

    /**
     * Fetch invoice data for the selected team and time periods
     */
    const handleFetchInvoices = async () => {
        setError('');
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/get_invoices', { 
                email, 
                password, 
                team_name: teamName, 
                months: selectedMonths.map(m => ({ month: parseInt(m.month), year: parseInt(m.year) }))
            });
            
            if (response.status === 200) {
                setInvoices(response.data.data || []);
                if (response.data.data.length === 0) {
                    setError('No invoices found for the selected periods');
                }
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to fetch invoices. Please try again.');
            }
            console.error('Invoice fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Generate and download Excel file with invoice data
     */
    const handleGenerateFile = async () => {
        setError('');
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/generate_excel', { 
                email, 
                password, 
                team_name: teamName, 
                months: selectedMonths.map(m => ({ month: parseInt(m.month), year: parseInt(m.year) }))
            }, { 
                responseType: 'blob'  // Important for file downloads
            });
            
            // Create downloadable link for the Excel file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.setAttribute('download', `invoices_${teamName}_${timestamp}.xlsx`);
            
            document.body.appendChild(link);
            link.click();
            
            // Clean up the temporary link
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (error.response && error.response.data) {
                // Convert blob error to text for better error handling
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        const errorData = JSON.parse(reader.result);
                        setError(errorData.error || 'Failed to generate Excel file');
                    } catch {
                        setError('Failed to generate Excel file');
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                setError('Failed to generate Excel file. Please try again.');
            }
            console.error('Excel generation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle month selection change for a specific time period
     * @param {Event} e - Input change event
     * @param {number} idx - Index of the month selection to update
     */
    const handleMonthChange = (e, idx) => {
        const newMonths = [...selectedMonths];
        newMonths[idx] = { ...newMonths[idx], month: e.target.value };
        setSelectedMonths(newMonths);
        setError(''); // Clear errors when user makes changes
    };

    /**
     * Handle year selection change for a specific time period
     * @param {Event} e - Input change event
     * @param {number} idx - Index of the year selection to update
     */
    const handleYearChange = (e, idx) => {
        const newMonths = [...selectedMonths];
        newMonths[idx] = { ...newMonths[idx], year: e.target.value };
        setSelectedMonths(newMonths);
        setError(''); // Clear errors when user makes changes
    };

    /**
     * Add a new month/year selection row for multi-period reports
     */
    const addMonthSelection = () => {
        setSelectedMonths([...selectedMonths, { month: '', year: '' }]);
    };

    /**
     * Remove a month/year selection row
     * @param {number} idx - Index of the selection to remove
     */
    const removeMonthSelection = (idx) => {
        if (selectedMonths.length > 1) {
            const newMonths = selectedMonths.filter((_, index) => index !== idx);
            setSelectedMonths(newMonths);
        }
    };

    return (
        <div className="invoice-fetcher">
            <div className="header">
                <img src="/img/CoMotion_Logo.jpeg" alt="CoMotion Logo" />
                <div className="header-content">
                    <h1>CoMotion Financial Reports</h1>
                    <button onClick={onLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            <div className="form-container">
                {/* Error message display */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Team/Company Selection Dropdown */}
                <div className="form-group">
                    <label htmlFor="team-select">Select Team/Company:</label>
                    <select 
                        id="team-select"
                        value={teamName} 
                        onChange={(e) => setTeamName(e.target.value)}
                        disabled={isLoading}
                        className="form-select"
                    >
                        <option value="">Choose a team...</option>
                        {teams.map(team => (
                            <option key={team.RecordID} value={team.TeamName}>
                                {team.TeamName}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Dynamic Month/Year Selection Inputs */}
                <div className="form-group">
                    <label>Select Reporting Periods:</label>
                    {selectedMonths.map((date, idx) => (
                        <div key={idx} className="date-selection">
                            <input 
                                type="number" 
                                placeholder="Month (1-12)" 
                                value={date.month} 
                                onChange={(e) => handleMonthChange(e, idx)}
                                min="1"
                                max="12"
                                disabled={isLoading}
                                className="month-input"
                            />
                            <input 
                                type="number" 
                                placeholder="Year (e.g., 2023)" 
                                value={date.year} 
                                onChange={(e) => handleYearChange(e, idx)}
                                min="2020"
                                max="2030"
                                disabled={isLoading}
                                className="year-input"
                            />
                            {selectedMonths.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => removeMonthSelection(idx)}
                                    className="remove-btn"
                                    disabled={isLoading}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Action Buttons */}
                <div className="button-group">
                    <button 
                        onClick={addMonthSelection}
                        disabled={isLoading}
                        className="btn-secondary"
                    >
                        Add Month
                    </button>
                    <button 
                        onClick={handleFetchInvoices}
                        disabled={isLoading}
                        className="btn-primary"
                    >
                        {isLoading ? 'Loading...' : 'Fetch Invoices'}
                    </button>
                    <button 
                        onClick={handleGenerateFile}
                        disabled={isLoading}
                        className="btn-success"
                    >
                        {isLoading ? 'Generating...' : 'Generate Excel File'}
                    </button>
                </div>
            </div>
            
            {/* Invoice Data Table */}
            {invoices.length > 0 && (
                <div className="table-container">
                    <h3>Invoice Results ({invoices.length} found)</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Team Name</th>
                                <th>Invoice From Date</th>
                                <th>Invoice To Date</th>
                                <th>Gross Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice.RecordID}>
                                    <td>{invoice.RecordID}</td>
                                    <td>{invoice.Invoice_BillToName}</td>
                                    <td>{new Date(invoice.Invoice_InvoiceFromDate).toLocaleDateString()}</td>
                                    <td>{new Date(invoice.Invoice_InvoiceToDate).toLocaleDateString()}</td>
                                    <td>${parseFloat(invoice.Invoice_TotalGrossAmount || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoiceFetcher;
