// src/App.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function App() {
    const navigate = useNavigate();

    return (
        <div className="container landing-page">
            <h1>Welcome to Chess Trainer</h1>
            <p>Sharpen your chess skills with openings, puzzles, and analysis.</p>
            <div className="button-group">
                <button onClick={() => navigate('/openings')}>Openings</button>
                <button onClick={() => navigate('/profile')}>Profile</button>
                <button onClick={() => navigate('/bot')}>Play vs Bot</button>
                <button onClick={() => navigate('/login')}>Login</button>
                <button onClick={() => navigate('/register')}>Register</button>
            </div>
        </div>

    );
}
