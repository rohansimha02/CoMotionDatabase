/**
 * CoMotion Financial Reports - Main Application Component
 * 
 * This is the root component that manages the application's authentication state
 * and renders either the login form or the main invoice fetcher interface.
 * 
 * @author Rohan Simha
 * @created For CoMotion Startup Incubator
 */

import React, { useState } from 'react';
import Login from './Login';
import InvoiceFetcher from './InvoiceFetcher';
import './styles.css';

const App = () => {
    // Authentication state management
    // isAuthenticated: boolean flag for login status
    // email/password: stored credentials for API calls
    const [auth, setAuth] = useState({ isAuthenticated: false, email: '', password: '' });

    /**
     * Handle successful user login
     * @param {string} email - User's email/username
     * @param {string} password - User's password
     */
    const handleLogin = (email, password) => {
        setAuth({ isAuthenticated: true, email, password });
    };

    /**
     * Handle user logout
     */
    const handleLogout = () => {
        setAuth({ isAuthenticated: false, email: '', password: '' });
    };

    return (
        <div className="app">
            {/* Conditional rendering based on authentication status */}
            {auth.isAuthenticated ? (
                // Show main application interface after login
                <InvoiceFetcher 
                    email={auth.email} 
                    password={auth.password}
                    onLogout={handleLogout}
                />
            ) : (
                // Show login form for unauthenticated users
                <Login onLogin={handleLogin} />
            )}
        </div>
    );
};

export default App;
