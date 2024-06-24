import React, { useState } from 'react';
import axios from 'axios';
import Login from './Login';

function App() {
    const [user, setUser] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [invoices, setInvoices] = useState([]);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const fetchInvoices = () => {
        const { email, password } = user;
        axios.get(`http://localhost:5000/get-invoices`, {
            params: { email, password, team_name: teamName, start_date: startDate, end_date: endDate }
        })
        .then(response => {
            setInvoices(response.data.Records || []);
        })
        .catch(error => {
            console.error('Error fetching invoices:', error);
        });
    };

    return (
        <div className="App">
            {user ? (
                <>
                    <div>
                        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Enter team name" />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <button onClick={fetchInvoices}>Fetch Invoices</button>
                    </div>
                    <ul>
                        {invoices.map(invoice => (
                            <li key={invoice.Id}>Amount: {invoice.TotalAmount}, Date: {invoice.InvoiceFromDate}</li>
                        ))}
                    </ul>
                </>
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;
