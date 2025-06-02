// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import './Profile.css';
import MistakePreview from "../components/MistakePreview";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    // Chess.com import controls
    const [chesscomUsername, setChesscomUsername] = useState('');
    const [archives, setArchives] = useState([]);
    const [selectedArchive, setSelectedArchive] = useState('');
    const [archiveGames, setArchiveGames] = useState([]); // Games fetched from selected archive

    // Stored games from our DB (unchanged)
    const [games, setGames] = useState([]);
    const [mistakesDB, setMistakesDB] = useState([]);
    const [analyzingDB, setAnalyzingDB] = useState(false);

    // Mistake candidates for archive games
    const [mistakesArchive, setMistakesArchive] = useState([]);
    const [analyzingArchive, setAnalyzingArchive] = useState(false);
    const [selectedMistake, setSelectedMistake] = useState(null);

    // On mount: fetch user profile & stored games
    useEffect(() => {
        async function fetchProfileAndGames() {
            try {
                console.log('[Profile] Fetching user profile...');
                const meRes = await fetch('http://localhost:4000/api/auth/me', { credentials: 'include' });
                if (!meRes.ok) throw new Error('Not authenticated');
                const meData = await meRes.json();
                setUser(meData);
                console.log('[Profile] Logged in as:', meData.username);

                console.log('[Profile] Fetching stored games...');
                const gamesRes = await fetch('http://localhost:4000/api/games', { credentials: 'include' });
                if (gamesRes.ok) {
                    const gamesData = await gamesRes.json();
                    setGames(gamesData);
                    console.log(`[Profile] Retrieved ${gamesData.length} stored games.`);
                } else {
                    setGames([]);
                    console.log('[Profile] No stored games or fetch failed.');
                }
            } catch (err) {
                console.error('[Profile] Error fetching profile or games:', err);
                setError(err.message);
            }
        }
        fetchProfileAndGames();
    }, []);
    function cleanChessComPgn(rawPgn) {
        if (!rawPgn) return '';

        let cleaned = rawPgn.replace(/\{[^}]*\}/g, ''); // remove {...}
        cleaned = cleaned.replace(/\[.*?"[^"]*"\]/g, ''); // remove headers
        cleaned = cleaned.replace(/\d+\.\.\./g, ''); // remove 1...
        cleaned = cleaned.replace(/\s+/g, ' '); // collapse whitespace
        cleaned = cleaned.replace(/(\d+)\. /g, '$1.'); // fix "1. e4" → "1.e4"

        const moveTokens = cleaned.trim().split(' ');
        const moveLines = [];
        for (let i = 0; i < moveTokens.length; i += 12) {
            moveLines.push(moveTokens.slice(i, i + 12).join(' '));
        }

        return moveLines.join('\n');
    }




    // Fetch Chess.com archives whenever user enters a username
    useEffect(() => {
        if (!chesscomUsername) return;
        console.log('[Profile] Fetching archives for', chesscomUsername);
        fetch(`https://api.chess.com/pub/player/${chesscomUsername}/games/archives`)
            .then((res) => res.json())
            .then((data) => {
                setArchives(data.archives || []);
                console.log(`[Profile] Retrieved ${data.archives?.length || 0} archive URLs.`);
            })
            .catch((err) => {
                console.error('[Profile] Error fetching archives:', err);
                setArchives([]);
            });
    }, [chesscomUsername]);

    // Fetch all games in a chosen archive (date, result, PGN)
    const fetchArchiveGames = async () => {
        if (!selectedArchive) return;
        console.log('[Profile] Loading games from archive URL:', selectedArchive);
        try {
            const res = await fetch(selectedArchive);
            const data = await res.json();
            const rawGames = data.games || [];
            console.log(`[Profile] Archive contains ${rawGames.length} games.`);

            // Map to simplified objects and trim whitespace in PGN
            const formatted = rawGames.map((g, idx) => {
                const rawPgn = g.pgn || '';
                const trimmedPgn = rawPgn.trim();
                const userIsWhite = g.white.username.toLowerCase() === chesscomUsername.toLowerCase();

                if (idx < 3) {
                    if (!rawPgn) {
                        console.warn(`[Profile] PGN missing for game ${g.url}`);
                    } else {
                        console.log(`[Profile] Sample PGN for game ${g.url}:\n${trimmedPgn.slice(0, 200)}...`);
                    }
                }

                return {
                    gameId: g.url,
                    pgn: trimmedPgn,
                    result: userIsWhite ? g.white.result : g.black.result,
                    date: new Date(g.end_time * 1000),
                    isWhite: userIsWhite, // ✅ Add this
                };
            });


            setArchiveGames(formatted);
        } catch (err) {
            console.error('[Profile] Error loading archive games:', err);
            setArchiveGames([]);
        }
    };

    // // Analyze mistakes in archive games (with loadPgn instead of load_pgn)
    // const analyzeArchiveMistakes = async () => {
    //     if (archiveGames.length === 0) {
    //         console.log('[Profile] No archive games to analyze.');
    //         return;
    //     }
    //     console.log('[Profile] Starting analysis on archive games...');
    //     setAnalyzingArchive(true);
    //     const allMistakes = [];
    //
    //     for (const gameObj of archiveGames) {
    //         const { gameId, date, pgn } = gameObj;
    //         console.log(`[Profile] Analyzing archive game ${gameId}, date ${date.toLocaleDateString()}`);
    //         // First normalize:
    //         const cleaned = cleanChessComPgn(pgn);
    //         console.log('[PGN] Final cleaned output:\n' + cleaned);
    //         // Then load the cleaned PGN
    //         const chess = new Chess();
    //         try {
    //             const loaded = chess.loadPgn(cleaned);
    //             if (!loaded) {
    //                 console.warn('⚠️ PGN failed to load:', gameId);
    //                 console.warn(cleaned);
    //             }
    //         } catch (err) {
    //             console.error('❌ Exception while loading PGN:', err);
    //         }
    //         const history = chess.history({ verbose: true });
    //         chess.reset();
    //
    //         for (let ply = 0; ply < history.length; ply++) {
    //             const fenBefore = chess.fen();
    //             const actualMoveObj = history[ply];
    //             const actualSan = actualMoveObj.san;
    //             console.log(`  [ARCH] Ply ${ply + 1}, actual move: ${actualSan}, FEN: ${fenBefore}`);
    //
    //             try {
    //                 const analyzeRes = await fetch('http://localhost:4000/api/analyze', {
    //                     method: 'POST',
    //                     headers: { 'Content-Type': 'application/json' },
    //                     body: JSON.stringify({ fen: fenBefore, depth: 12 }),
    //                 });
    //                 if (!analyzeRes.ok) {
    //                     console.warn(`[ARCH] Analyze API returned ${analyzeRes.status} for FEN ${fenBefore}`);
    //                     chess.move(actualSan, { sloppy: true });
    //                     continue;
    //                 }
    //                 const analyzeData = await analyzeRes.json();
    //                 let bestMoveSAN = null;
    //                 if (Array.isArray(analyzeData)) {
    //                     const best = analyzeData.find((m) => m.type === 'bestmove');
    //                     bestMoveSAN = best ? best.san : analyzeData[analyzeData.length - 1].san;
    //                 } else {
    //                     bestMoveSAN = analyzeData.san;
    //                 }
    //                 console.log(`    [ARCH] Best move SAN: ${bestMoveSAN}`);
    //
    //                 if (bestMoveSAN && bestMoveSAN !== actualSan) {
    //                     console.log(`    [ARCH] Mistake detected: actual ${actualSan}, best ${bestMoveSAN}`);
    //                     allMistakes.push({
    //                         gameId,
    //                         date,
    //                         moveNumber: Math.floor(ply / 2) + 1,
    //                         ply: ply + 1,
    //                         actualSan,
    //                         bestSan: bestMoveSAN,
    //                     });
    //                 }
    //             } catch (err) {
    //                 console.error(`[ARCH] Error during analysis of ply ${ply + 1}:`, err);
    //             }
    //
    //             chess.move(actualSan, { sloppy: true });
    //         }
    //     }
    //
    //     setMistakesArchive(allMistakes);
    //     setAnalyzingArchive(false);
    //     console.log(`[Profile] Completed analysis on archive games. Found ${allMistakes.length} mistakes.`);
    // };
    const analyzeArchiveMistakes = async () => {
        if (archiveGames.length === 0) {
            console.log('[Profile] No archive games to analyze.');
            return;
        }

        console.log('[Profile] Starting analysis on archive games...');
        setAnalyzingArchive(true);
        const allMistakes = [];

        for (const gameObj of archiveGames) {
            const { gameId, date, pgn, isWhite } = gameObj;
            const cleaned = cleanChessComPgn(pgn);
            console.log(`[PGN] Final cleaned output for game ${gameId}:\n${cleaned}`);

            const chess = new Chess();
            // try {
            //     const loaded = chess.loadPgn(cleaned);
            //     if (!loaded) {
            //         console.warn('⚠️ PGN failed to load:', gameId);
            //         continue;
            //     }
            // } catch (err) {
            //     console.error('❌ Exception while loading PGN:', err);
            //     continue;
            // }
            try {
                const loaded = chess.loadPgn(cleaned);
                if (!loaded) {
                    console.warn('⚠️ PGN failed to load:', gameId);
                    console.warn(cleaned);
                }
            } catch (err) {
                console.error('❌ Exception while loading PGN:', err);
            }
            const history = chess.history({ verbose: true });
            chess.reset();

            for (let ply = 0; ply < history.length; ply++) {
                const actualMove = history[ply];
                const actualSan = actualMove.san;

                const isUsersMove = (isWhite && ply % 2 === 0) || (!isWhite && ply % 2 === 1);
                const fenBefore = chess.fen();

                if (!isUsersMove) {
                    chess.move(actualSan, { sloppy: true });
                    continue;
                }

                console.log(`  [ARCH] Ply ${ply + 1}, user move: ${actualSan}, FEN: ${fenBefore}`);

                try {
                    const res = await fetch('http://localhost:4000/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fen: fenBefore, actualSan }),
                    });

                    if (!res.ok) {
                        console.warn(`[ARCH] Analyze API error at ply ${ply + 1}`);
                        chess.move(actualSan, { sloppy: true });
                        continue;
                    }

                    const data = await res.json();
                    const { evalBefore, evalAfter, evalDrop, bestSan, isBlunder } = data;

                    if (isBlunder) {
                        console.log(`  ⚠️ Mistake detected! ${actualSan} vs ${bestSan} (Δ: ${evalDrop})`);
                        allMistakes.push({
                            gameId,
                            date,
                            ply: ply + 1,
                            moveNumber: Math.floor(ply / 2) + 1,
                            actualSan,
                            bestSan,
                            evalBefore,
                            evalAfter,
                            evalDrop,
                        });
                    }

                } catch (err) {
                    console.error(`[ARCH] Error analyzing ply ${ply + 1}:`, err);
                }

                chess.move(actualSan, { sloppy: true });
            }


        }

        setMistakesArchive(allMistakes);
        setAnalyzingArchive(false);
        console.log(`[Profile] Done analyzing archive games. Found ${allMistakes.length} mistake candidates.`);
    };


    // Analyze mistakes in stored (DB) games (also switch load_pgn → loadPgn)
    const analyzeDBMistakes = async () => {
        if (games.length === 0) {
            console.log('[Profile] No stored games to analyze.');
            return;
        }
        console.log('[Profile] Starting analysis on stored games...');
        setAnalyzingDB(true);
        const allMistakes = [];

        for (const gameObj of games) {
            const { _id, date, pgn } = gameObj;
            console.log(`[Profile] Analyzing stored game ID ${_id}, date ${date.toLocaleDateString()}`);
            const chess = new Chess();
            if (!chess.loadPgn(pgn)) {
                console.warn(`[Profile] Failed to load PGN for stored game ${_id}`);
                continue;
            }
            const history = chess.history({ verbose: true });
            chess.reset();

            for (let ply = 0; ply < history.length; ply++) {
                const fenBefore = chess.fen();
                const actualMoveObj = history[ply];
                const actualSan = actualMoveObj.san;
                console.log(`  [DB] Ply ${ply + 1}, actual move: ${actualSan}, FEN: ${fenBefore}`);

                try {
                    const analyzeRes = await fetch('http://localhost:4000/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fen: fenBefore, depth: 12 }),
                    });
                    if (!analyzeRes.ok) {
                        console.warn(`[DB] Analyze API returned ${analyzeRes.status} for FEN ${fenBefore}`);
                        chess.move(actualSan, { sloppy: true });
                        continue;
                    }
                    const analyzeData = await analyzeRes.json();
                    let bestMoveSAN = null;
                    if (Array.isArray(analyzeData)) {
                        const best = analyzeData.find((m) => m.type === 'bestmove');
                        bestMoveSAN = best ? best.san : analyzeData[analyzeData.length - 1].san;
                    } else {
                        bestMoveSAN = analyzeData.san;
                    }
                    console.log(`    [DB] Best move SAN: ${bestMoveSAN}`);

                    if (bestMoveSAN && bestMoveSAN !== actualSan) {
                        console.log(`    [DB] Mistake detected: actual ${actualSan}, best ${bestMoveSAN}`);
                        allMistakes.push({
                            gameId: _id,
                            date,
                            moveNumber: Math.floor(ply / 2) + 1,
                            ply: ply + 1,
                            actualSan,
                            bestSan: bestMoveSAN,
                        });
                    }
                } catch (err) {
                    console.error(`[DB] Error during analysis of ply ${ply + 1}:`, err);
                }

                chess.move(actualSan, { sloppy: true });
            }
        }

        setMistakesDB(allMistakes);
        setAnalyzingDB(false);
        console.log(`[Profile] Completed analysis on stored games. Found ${allMistakes.length} mistakes.`);
    };

    if (error) return <div className="error">{error}</div>;
    if (!user) return <div>Loading profile…</div>;

    return (
        <div className="profile-page">
            <h2>Welcome, {user.username}</h2>
            <button
                onClick={() =>
                    fetch('http://localhost:4000/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include',
                    }).then(() => (window.location = '/'))
                }
            >
                Logout
            </button>

            {/* Import from Chess.com Archive */}
            <section className="archive-import">
                <h3>Import Games from Chess.com</h3>
                <input
                    value={chesscomUsername}
                    onChange={(e) => setChesscomUsername(e.target.value)}
                    placeholder="Chess.com username"
                />
                <button
                    onClick={() => {
                        setArchives([]);
                        setArchiveGames([]);
                        setError(null);
                    }}
                >
                    Clear
                </button>
                <button
                    onClick={() =>
                        fetch(`https://api.chess.com/pub/player/${chesscomUsername}/games/archives`)
                            .then((res) => res.json())
                            .then((data) => {
                                setArchives(data.archives || []);
                                console.log(`[Profile] Retrieved ${data.archives?.length || 0} archive URLs.`);
                            })
                            .catch((err) => {
                                console.error('[Profile] Error fetching archives:', err);
                                setArchives([]);
                            })
                    }
                    disabled={!chesscomUsername}
                >
                    Fetch Archives
                </button>

                {archives.length > 0 && (
                    <div className="archive-selector">
                        <h4>Choose an Archive:</h4>
                        <select
                            value={selectedArchive}
                            onChange={(e) => setSelectedArchive(e.target.value)}
                        >
                            <option value="">— pick an archive —</option>
                            {archives.map((url) => {
                                const parts = url.split('/');
                                const label = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
                                return (
                                    <option key={url} value={url}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                        <button onClick={fetchArchiveGames} disabled={!selectedArchive}>
                            Load Games Data
                        </button>
                    </div>
                )}

                {archiveGames.length > 0 && (
                    <div className="archive-games-list">
                        <h4>Games in Selected Archive:</h4>
                        <ul>
                            {archiveGames.map((g) => (
                                <li key={g.gameId}>
                                    {g.date.toLocaleDateString()} – {g.result}{' '}
                                    <button
                                        onClick={() =>
                                            // alert(`PGN:\n\n${g.pgn.replace(/\r?\n/g, ' ')}`)
                                            // alert('PGN:\n\n' + cleanChessComPgn(g.pgn).replace(/\r?\n/g, ' '))
                                            console.log('PGN:', cleanChessComPgn(g.pgn))
                                        }
                                    >
                                        View PGN
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={analyzeArchiveMistakes}
                            disabled={analyzingArchive || archiveGames.length === 0}
                        >
                            {analyzingArchive ? 'Analyzing Archive…' : 'Analyze Archive Games'}
                        </button>
                    </div>
                )}
            </section>

            {/* Stored Games from DB */}
            <section className="stored-games">
                <h3>Your Stored Games</h3>
                {games.length === 0 ? (
                    <p>No games imported to the database yet.</p>
                ) : (
                    <ul>
                        {games.map((g) => (
                            <li key={g._id}>
                                {new Date(g.date).toLocaleDateString()} – {g.result}{' '}
                                <button
                                    onClick={() =>
                                        alert(`PGN:\n\n${g.pgn.replace(/\r?\n/g, ' ')}`)
                                    }
                                >
                                    View PGN
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={analyzeDBMistakes} disabled={analyzingDB || games.length === 0}>
                    {analyzingDB ? 'Analyzing Stored Games…' : 'Analyze Stored Games'}
                </button>
            </section>

            {/* Mistakes from Stored Games */}
            {mistakesDB.length > 0 && (
                <section className="mistakes-list">
                    <h3>Mistakes in Stored Games</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Move #</th>
                            <th>Actual Move</th>
                            <th>Engine’s Best</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mistakesDB.map((m, idx) => (
                            <tr key={`${m.gameId}-${m.ply}-${idx}`}>
                                <td>{new Date(m.date).toLocaleDateString()}</td>
                                <td>{m.moveNumber}</td>
                                <td>{m.actualSan}</td>
                                <td>{m.bestSan}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Mistakes from Archive Games */}
            {mistakesArchive.length > 0 && (
                <section className="mistakes-archive-list">
                    <h3>Mistakes in Archive Games</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Move #</th>
                            <th>Actual Move</th>
                            <th>Engine’s Best</th>

                        </tr>
                        </thead>
                        <tbody>
                        {mistakesArchive.map((m, idx) => (
                            <tr key={`${m.gameId}-${m.ply}-${idx}`}>
                                <td>{new Date(m.date).toLocaleDateString()}</td>
                                <td>{m.moveNumber}</td>
                                <td>{m.actualSan}</td>
                                <td>{m.bestSan}</td>
                                <td>
                                    <button onClick={() => setSelectedMistake(m)}>Preview</button>
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            )}
            {selectedMistake && (
                <section className="mistake-preview">
                    <h3>Mistake Preview</h3>
                    <MistakePreview
                        game={archiveGames.find(g => g.gameId === selectedMistake.gameId)}
                        mistake={selectedMistake}
                        onClose={() => setSelectedMistake(null)}
                    />
                </section>
            )}

        </div>
    );
}