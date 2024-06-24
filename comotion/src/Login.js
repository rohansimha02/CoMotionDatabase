import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });
            if (response.data.message === "Login successful") {
                onLoginSuccess({ email, password });  // Pass credentials up for future requests
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('Login failed. Please check your email and password.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />
            </div>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;
