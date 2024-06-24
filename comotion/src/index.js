import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';  // Make sure your CSS is appropriately set up for your app's styling.
import 'bootstrap/dist/css/bootstrap.min.css';  // Ensures Bootstrap is available for styling.
import reportWebVitals from './reportWebVitals';  // Import reportWebVitals at the top as required by ESLint.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Optional: reportWebVitals is a tool that can help measure the performance of your app
reportWebVitals();
