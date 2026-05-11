import React, { useState } from 'react';
import '../styles/PlayerLookup.css';
import GameViewer from "../components/GamePreview";
import { Chess } from 'chess.js';
import { useEffect } from 'react';

export default function PlayerLookup() {
    const [username, setUsername] = useState('');
    const [archives, setArchives] = useState([]);
    const [selectedArchive, setSelectedArchive] = useState('');
    const [archiveGames, setArchiveGames] = useState([]);
    const [selectedMistakeGame, setSelectedMistakeGame] = useState(null);
    const [mistakesForSelectedGame, setMistakesForSelectedGame] = useState([]);
    const [analyzingGameId, setAnalyzingGameId] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch('http://localhost:4000/api/auth/me', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.chesscomUsername) {
                        setUsername(data.chesscomUsername);
                        console.log('[Lookup] Auto-filled with user Chess.com username:', data.chesscomUsername);
                    }
                }
            } catch (err) {
                console.error('[Lookup] Failed to fetch user profile:', err);
            }
        }

        fetchProfile();
    }, []);

    const fetchArchives = async () => {
        try {
            const res = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
            const data = await res.json();
            setArchives(data.archives || []);
        } catch (err) {
            console.error('[Lookup] Archive fetch error:', err);
            setArchives([]);
        }
    };

    const fetchArchiveGames = async () => {
        try {
            const res = await fetch(selectedArchive);
            const data = await res.json();
            const games = data.games.map(g => ({
                gameId: g.url,
                pgn: g.pgn.trim(),
                result: g.white.username.toLowerCase() === username.toLowerCase() ? g.white.result : g.black.result,
                date: new Date(g.end_time * 1000),
                isWhite: g.white.username.toLowerCase() === username.toLowerCase(),
            }));
            setArchiveGames(games);
        } catch (err) {
            console.error('[Lookup] Archive game fetch error:', err);
        }
    };

    async function analyzeSingleGame(game) {
        const cleaned = cleanChessComPgn(game.pgn);
        const chess = new Chess();

        try {
            chess.loadPgn(cleaned);
        } catch (err) {
            console.error('[Lookup] PGN load error:', err);
            return;
        }

        const history = chess.history({ verbose: true });
        const mistakes = [];
        chess.reset();

        for (let ply = 0; ply < history.length; ply++) {
            const move = history[ply];
            const fen = chess.fen();
            const actualSan = move.san;
            const isUsersMove = (game.isWhite && ply % 2 === 0) || (!game.isWhite && ply % 2 === 1);

            if (!isUsersMove) {
                chess.move(actualSan, { sloppy: true });
                continue;
            }

            try {
                const res = await fetch('http://localhost:4000/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fen, actualSan }),
                });

                if (!res.ok) throw new Error(`Eval failed at ply ${ply + 1}`);
                const data = await res.json();

                if (data.isBlunder) {
                    mistakes.push({
                        gameId: game.gameId,
                        date: game.date,
                        ply: ply + 1,
                        moveNumber: Math.floor(ply / 2) + 1,
                        actualSan,
                        bestSan: data.bestSan,
                        evalBefore: data.evalBefore,
                        evalAfter: data.evalAfter,
                        evalDrop: data.evalDrop,
                    });
                }
            } catch (err) {
                console.error(`[Lookup] Analyze error at ply ${ply + 1}`, err);
            }

            chess.move(actualSan, { sloppy: true });
        }

        setMistakesForSelectedGame(mistakes);
        setSelectedMistakeGame(game);
    }

    function cleanChessComPgn(rawPgn) {
        let cleaned = rawPgn.replace(/\{[^}]*\}/g, '');
        cleaned = cleaned.replace(/\[.*?"[^"]*"\]/g, '');
        cleaned = cleaned.replace(/\d+\.\.\./g, '');
        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/(\d+)\. /g, '$1.');
        return cleaned;
    }

    return (
        <div className="player-lookup-page">
            <div className="player-lookup-header">
                <h2> Chess.com Game Lookup</h2>
                <div className="lookup-controls">
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter Chess.com username"
                    />
                    <button onClick={fetchArchives} disabled={!username}>
                        Fetch Archives
                    </button>
                </div>
            </div>

            {archives.length > 0 && (
                <div className="archive-section">
                    <h3> Select Archive</h3>
                    <div className="archive-selector">
                        <select
                            value={selectedArchive}
                            onChange={(e) => setSelectedArchive(e.target.value)}
                        >
                            <option value="">— Select Archive —</option>
                            {archives.map((url) => {
                                const parts = url.split('/');
                                const label = `${parts.at(-2)}/${parts.at(-1)}`;
                                return <option key={url} value={url}>{label}</option>;
                            })}
                        </select>
                        <button onClick={fetchArchiveGames} disabled={!selectedArchive}>
                            Load Games
                        </button>
                    </div>
                </div>
            )}

            {archiveGames.length > 0 && (
                <div className="archive-games-grid">
                    <h3> Games in {selectedArchive.split('/').slice(-2).join('/')}</h3>
                    <div className="game-card-grid">
                        {archiveGames.map((g, index) => (
                            <div className="game-card" key={g.gameId}>
                                <p><strong> Date:</strong> {g.date.toLocaleDateString()}</p>
                                <p><strong> Result:</strong> {g.result}</p>
                                <p><strong> Side:</strong> {g.isWhite ? "White" : "Black"}</p>
                                <button
                                    onClick={async () => {
                                        setAnalyzingGameId(g.gameId);
                                        await analyzeSingleGame(g);
                                        setAnalyzingGameId(null);
                                    }}
                                    disabled={analyzingGameId !== null}
                                >
                                    {analyzingGameId === g.gameId ? "Analyzing..." : "View Game"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedMistakeGame && (
                <GameViewer
                    game={selectedMistakeGame}
                    mistakeList={mistakesForSelectedGame}
                    onClose={() => {
                        setSelectedMistakeGame(null);
                        setMistakesForSelectedGame([]);
                    }}
                />
            )}
        </div>

    );

}
