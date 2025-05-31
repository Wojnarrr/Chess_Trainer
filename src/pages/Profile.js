// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const [chesscomUsername, setChesscomUsername] = useState('');
    const [archives, setArchives] = useState([]);
    const [selectedArchive, setSelectedArchive] = useState('');
    const [archiveGames, setArchiveGames] = useState([]);

    // Fetch current user on mount
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('http://localhost:4000/api/auth/me', { credentials: 'include' });
                if (!res.ok) throw new Error('Not authenticated');
                const data = await res.json();
                setUser(data);
            } catch (e) {
                setError(e.message);
            }
        }
        fetchUser();
    }, []);

    // Fetch archives from Chess.com
    const fetchArchives = async () => {
        if (!chesscomUsername) return;
        try {
            const res = await fetch(
                `https://api.chess.com/pub/player/${chesscomUsername}/games/archives`
            );
            const data = await res.json();
            setArchives(data.archives || []);
            setSelectedArchive('');
            setArchiveGames([]);
        } catch {
            setArchives([]);
        }
    };

    // Fetch games for the selected archive URL
    const fetchArchiveGames = async () => {
        if (!selectedArchive) return;
        try {
            const res = await fetch(selectedArchive);
            const data = await res.json();
            setArchiveGames(data.games || []);
        } catch {
            setArchiveGames([]);
        }
    };

    if (error) return <div className="error">{error}</div>;
    if (!user) return <div>Loading profile...</div>;

    return (
        <div className="profile-page">
            <h2>Welcome, {user.username}</h2>
            <button
                onClick={async () => {
                    await fetch('http://localhost:4000/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    window.location.href = '/login';
                }}
            >
                Logout
            </button>

            <section className="archive-import">
                <h3>Enter Your Chess.com Username</h3>
                <input
                    type="text"
                    value={chesscomUsername}
                    onChange={e => setChesscomUsername(e.target.value)}
                    placeholder="Chess.com username"
                />
                <button onClick={fetchArchives} disabled={!chesscomUsername}>
                    Fetch Archives
                </button>

                {archives.length > 0 && (
                    <>
                        <h3>Select Archive</h3>
                        <select
                            value={selectedArchive}
                            onChange={e => setSelectedArchive(e.target.value)}
                        >
                            <option value="">— pick a month —</option>
                            {archives.map(url => (
                                <option key={url} value={url}>
                                    {url.split('/').slice(-2).join('/')}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={fetchArchiveGames}
                            disabled={!selectedArchive}
                        >
                            View Games
                        </button>
                    </>
                )}
            </section>

            <section className="archive-games">
                <h3>Archive Games</h3>
                {archiveGames.length === 0 ? (
                    <p>No games loaded</p>
                ) : (
                    <ul>
                        {archiveGames.map((g, i) => {
                            const date = new Date(g.end_time * 1000).toLocaleDateString();
                            const result =
                                g.white.username.toLowerCase() === chesscomUsername.toLowerCase()
                                    ? g.white.result
                                    : g.black.result;
                            // extract moves from PGN after headers
                            const idx = g.pgn.indexOf('\n\n');
                            const moves = idx >= 0 ? g.pgn.substr(idx + 2) : g.pgn;
                            return (
                                <li key={i} className="archive-game-item">
                                    <strong>{date}</strong> — {result}
                                    <pre className="pgn-moves">{moves}</pre>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
