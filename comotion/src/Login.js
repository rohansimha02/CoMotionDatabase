/**
 * Login Component - User Authentication Interface
 * 
 * Provides a form for users to authenticate against the Nexudus API
 * using their CoMotion workspace credentials.
 * 
 * @author Rohan Simha
 */

import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    // Form state management
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handle form submission and authentication
     * @param {Event} e - Form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');  // Clear previous errors
        setIsLoading(true);
        
        try {
            // Basic client-side validation
            if (!email || !password) {
                setError('Please enter both email and password');
                return;
            }
            
            if (!email.includes('@')) {
                setError('Please enter a valid email address');
                return;
            }
            
            // Send login request to Flask backend
            const response = await axios.post('http://localhost:5000/login', { 
                email, 
                password 
            });
            
            if (response.status === 200) {
                // Authentication successful - notify parent component
                onLogin(email, password);
            }
        } catch (error) {
            // Handle authentication errors with specific messages
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else if (error.code === 'ECONNREFUSED') {
                setError('Unable to connect to server. Please ensure the backend is running.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="header">
                <img src="/img/CoMotion_Logo.jpeg" alt="CoMotion Logo" />
                <h1>CoMotion Financial Reports</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login to Your Account</h2>
                
                {/* Error message display */}
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {/* Email input field */}
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    required
                    disabled={isLoading}
                />
                
                {/* Password input field */}
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter your password" 
                    required
                    disabled={isLoading}
                />
                
                {/* Submit button with loading state */}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
