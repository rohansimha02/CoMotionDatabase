/**
 * Application Entry Point
 * 
 * This file serves as the main entry point for the React application,
 * rendering the root App component into the DOM and importing global styles.
 * 
 * @author Rohan Simha
 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';  // Import CoMotion-specific styling

// Render the main App component into the root DOM element
// StrictMode helps identify potential problems in the application
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
