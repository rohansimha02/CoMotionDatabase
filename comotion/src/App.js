import React, { useState } from 'react';
import Login from './Login';
import InvoiceFetcher from './InvoiceFetcher';

const App = () => {
    const [auth, setAuth] = useState({ isAuthenticated: false, email: '', password: '' });

    const handleLogin = (email, password) => {
        setAuth({ isAuthenticated: true, email, password });
    };

    return (
        <div>
            {auth.isAuthenticated ? (
                <InvoiceFetcher email={auth.email} password={auth.password} />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
};

export default App;
