import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceFetcher = ({ email, password }) => {
    const [teamName, setTeamName] = useState('');
    const [selectedMonths, setSelectedMonths] = useState([{ month: '', year: '' }]);
    const [teams, setTeams] = useState([]);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchTeams = async () => {
            const response = await axios.get('/get_teams', {
                headers: {
                    username: email,
                    password: password
                }
            });
            setTeams(response.data.Records);
        };

        if (email && password) {
            fetchTeams();
        }
    }, [email, password]);

    const handleFetchInvoices = async () => {
        const response = await axios.post('/get_invoices', { email, password, team_name: teamName, months: selectedMonths });
        if (response.status === 200) {
            setInvoices(response.data.data);
        } else {
            alert('Failed to fetch invoices');
        }
    };

    const handleGenerateFile = async () => {
        const response = await axios.post('/generate_excel', { email, password, team_name: teamName, months: selectedMonths }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'invoices.xlsx');
        document.body.appendChild(link);
        link.click();
    };

    const handleMonthChange = (e, idx) => {
        const newMonths = [...selectedMonths];
        newMonths[idx] = { ...newMonths[idx], month: e.target.value };
        setSelectedMonths(newMonths);
    };

    const handleYearChange = (e, idx) => {
        const newMonths = [...selectedMonths];
        newMonths[idx] = { ...newMonths[idx], year: e.target.value };
        setSelectedMonths(newMonths);
    };

    const addMonthSelection = () => {
        setSelectedMonths([...selectedMonths, { month: '', year: '' }]);
    };

    return (
        <div>
            <select value={teamName} onChange={(e) => setTeamName(e.target.value)}>
                <option value="">Select Team</option>
                {teams.map(team => (
                    <option key={team.RecordID} value={team.TeamName}>{team.TeamName}</option>
                ))}
            </select>
            {selectedMonths.map((date, idx) => (
                <div key={idx}>
                    <input type="number" placeholder="Month" value={date.month} onChange={(e) => handleMonthChange(e, idx)} />
                    <input type="number" placeholder="Year" value={date.year} onChange={(e) => handleYearChange(e, idx)} />
                </div>
            ))}
            <button onClick={addMonthSelection}>Add Month</button>
            <button onClick={handleFetchInvoices}>Fetch Invoices</button>
            <button onClick={handleGenerateFile}>Generate File</button>
            <table className="table">
                <thead>
                    <tr>
                        <th>Invoice ID</th>
                        <th>Team Name</th>
                        <th>Invoice Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => (
                        <tr key={invoice.RecordID}>
                            <td>{invoice.RecordID}</td>
                            <td>{invoice.Invoice_BillToName}</td>
                            <td>{invoice.Invoice_InvoiceToDate}</td>
                            <td>{invoice.Invoice_TotalGrossAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceFetcher;
