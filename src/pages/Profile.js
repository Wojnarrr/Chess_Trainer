import React, { useState, useEffect } from 'react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [games, setGames] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                // Fetch current user
                const meRes = await fetch('http://localhost:4000/api/auth/me', {
                    credentials: 'include'
                });
                if (!meRes.ok) throw new Error('Not authenticated');
                const meData = await meRes.json();
                setUser(meData);

                // // Fetch user games
                // const gamesRes = await fetch('http://localhost:4000/api/games', {
                //     credentials: 'include'
                // });
                // if (!gamesRes.ok) throw new Error('Failed to fetch games');
                // const gamesData = await gamesRes.json();
                // setGames(gamesData);
                try {
                    const gamesRes = await fetch('http://localhost:4000/api/games', {
                        credentials: 'include'
                    });
                    if (gamesRes.ok) {
                        const gamesData = await gamesRes.json();
                        setGames(gamesData);
                    } else {
                        setGames([]);
                    }
                } catch {
                    // no games or network error, show empty list
                    setGames([]);
                }
            } catch (err) {
                setError(err.message);
            }
        }
        fetchProfile();
    }, []);

    const importGames = async () => {
        const res = await fetch('/api/games/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ chesscomUsername: username })
        });
        if (res.ok) {
            const { importedCount } = await res.json();
            alert(`Imported ${importedCount} games`);
            // reload games
            const list = await fetch('/api/games', { credentials: 'include' }).then(r=>r.json());
            setGames(list);
        } else {
            setError((await res.json()).error);
        }
    };

    if (error) return <div className="error">{error}</div>;
    if (!user) return <div>Loading...</div>;

    return (
        <div className="profile-page">
            <h2>Welcome, {user.username}</h2>
            <button onClick={() => fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).then(()=>window.location='/')}>Logout</button>
            <div className="import-section">
                <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Your Chess.com username" />
                <button onClick={importGames}>Import Games</button>
            </div>
            <h3>Your Games</h3>
            <ul>
                {/*{games.map(g => (*/}
                {/*    <li key={g.gameId}>{new Date(g.date).toLocaleDateString()} – {g.result}</li>*/}
                {/*))}*/}
            </ul>
        </div>
    );
}