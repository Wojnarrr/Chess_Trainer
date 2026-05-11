import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function App() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Optionally auto-fetch user profile
        fetch('http://localhost:4000/api/auth/me', {
            credentials: 'include'
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => setUser(data))
            .catch(() => setUser(null));
    }, []);

    return (
        <div className="container landing-page">
            <h1 className="landing-title">♔ Chess Trainer</h1>
            <p className="landing-subtitle">Master your openings. Fix your mistakes. Sharpen your tactics.</p>

            <div className="feature-highlights">
                <div>
                    <h3>🎯  Targeted Training</h3>
                    <p>Practice real mistakes from your own games using Stockfish-powered analysis.</p>
                </div>
                <div>
                    <h3>📖 Opening Explorer</h3>
                    <p>Learn and rehearse your favorite openings in a structured format.</p>
                </div>
                <div>
                    <h3>🤖 Bot Matches</h3>
                    <p>Play against custom bots with difficulty levels.</p>
                </div>
            </div>

            <div className="button-group">
                <button onClick={() => navigate('/openings')}>Openings</button>
                <button onClick={() => navigate('/bot')}>Play vs Bot</button>
                <button onClick={() => navigate('/profile')}>Profile</button>
                {user ? (
                    <button onClick={() => navigate('/profile')}>Go to Profile</button>
                ) : (
                    <>
                        <button onClick={() => navigate('/login')}>Login</button>
                        <button onClick={() => navigate('/register')}>Register</button>
                    </>
                )}
            </div>
        </div>
    );
}
