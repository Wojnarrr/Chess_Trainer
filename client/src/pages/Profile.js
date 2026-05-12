// client/src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    // Chess.com import controls
    const [chesscomUsername, setChesscomUsername] = useState('');

    // On mount: fetch user profile
    useEffect(() => {
        async function fetchProfile() {
            try {
                console.log('[Profile] Fetching user profile...');
                const meRes = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
                if (!meRes.ok) throw new Error('Not authenticated');
                const meData = await meRes.json();
                setUser(meData);
                setChesscomUsername(meData.chesscomUsername || '');
                console.log('[Profile] Logged in as:', meData.username);

            } catch (err) {
                console.error('[Profile] Error fetching profile', err);
                setError(err.message);
            }
        }
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!user) return;

        async function initPuzzlesIfNeeded() {
            try {
                const res = await fetch(`${API_URL}/api/puzzles/init`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log(`[Profile] Puzzle init: ${data.message}`);
                } else {
                    console.warn('[Profile] Puzzle init failed');
                }
            } catch (err) {
                console.error('[Profile] Error checking for puzzle init:', err);
            }
        }

        initPuzzlesIfNeeded();
    }, [user]);



    if (error) return <div className="error">{error}</div>;
    if (!user) return <div>Loading profile…</div>;

    return (
        <div className="profile-page">
            <h2>Welcome, {user.username}</h2>

            {user?.chesscomUsername ? (
                <>
                    <p>Linked Chess.com account:</p>
                    <p><strong>{user.chesscomUsername}</strong></p>
                    <button onClick={() => setUser((u) => ({ ...u, chesscomUsername: null }))}>
                        Edit Username
                    </button>
                </>
            ) : (
                <>
                    <p>Link your Chess.com account to import games:</p>
                    <input
                        value={chesscomUsername}
                        onChange={(e) => setChesscomUsername(e.target.value)}
                        placeholder="Enter your Chess.com username"
                    />
                    <button
                        onClick={async () => {
                            const res = await fetch(`${API_URL}/api/auth/chesscom`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ username: chesscomUsername }),
                            });
                            if (res.ok) {
                                const data = await res.json();
                                setUser((u) => ({ ...u, chesscomUsername: data.chesscomUsername }));
                            }
                        }}
                        disabled={!chesscomUsername}
                    >
                        Save
                    </button>
                </>
            )}

            <button
                onClick={() =>
                    fetch(`${API_URL}/api/auth/logout`, {
                        method: 'POST',
                        credentials: 'include',
                    }).then(() => (window.location = '/'))
                }
            >
                Logout
            </button>

            <section className="puzzle-controls">
                <h3>Training Puzzles</h3>
                <button
                    onClick={async () => {
                        const confirm = window.confirm("This will replace your previous puzzle set. Continue?");
                        if (!confirm) return;
                        try {
                            const res = await fetch(`${API_URL}/api/puzzles/refresh`, {
                                method: 'POST',
                                credentials: 'include'
                            });
                            const data = await res.json();
                            alert(`✅ ${data.message}`);
                        } catch (err) {
                            alert('⚠️ An error occurred during puzzle refresh.');
                        }
                    }}
                >
                    Refresh Puzzles
                </button>
            </section>
        </div>
    );

}