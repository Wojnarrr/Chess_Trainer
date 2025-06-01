// src/components/Explorer.js
import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './Explorer.css';

export default function Explorer({ openingMap }) {
    const [game] = useState(() => new Chess());
    const [position, setPosition] = useState(game.fen());

    // Candidates and history
    const [candidates, setCandidates] = useState([]); // [[name, moves], ...]
    const [history, setHistory] = useState([]);         // array of SANs
    const [idx, setIdx] = useState(0);                   // next ply index

    // UI state
    const [shakeSq, setShakeSq] = useState(null);
    const [hintSquares, setHintSquares] = useState([]);
    const [sequenceOver, setSequenceOver] = useState(false);
    const [lastSequence, setLastSequence] = useState(null);

    // Initialize or restart Explorer
    const initExplorer = () => {
        game.reset();
        setPosition(game.fen());
        setCandidates(Object.entries(openingMap));
        setHistory([]);
        setIdx(0);
        setShakeSq(null);
        setHintSquares([]);
        setSequenceOver(false);
        setLastSequence(null);
    };

    // Handle user and computer moves
    const onPieceDrop = (source, target) => {
        if (sequenceOver) return false;

        // Attempt user move
        const temp = new Chess(game.fen());
        let moveObj;
        try { moveObj = temp.move({ from: source, to: target, promotion: 'q' }); }
        catch { moveObj = null; }
        if (!moveObj) {
            setShakeSq(source);
            setTimeout(() => setShakeSq(null), 500);
            return false;
        }
        const san = moveObj.san;

        // Filter openings by user SAN
        const userFiltered = candidates.filter(([, moves]) => moves[idx] === san);
        if (userFiltered.length === 0) {
            setShakeSq(source);
            setTimeout(() => setShakeSq(null), 500);
            return false;
        }

        // Apply user move
        game.move({ from: source, to: target, promotion: 'q' });
        setPosition(game.fen());
        setHistory(h => [...h, san]);
        const newIdx = idx + 1;
        setIdx(newIdx);
        setCandidates(userFiltered);

        // If only one opening remains and no reply, finish
        const possibleReplies = [...new Set(
            userFiltered.map(([, moves]) => moves[newIdx]).filter(Boolean)
        )];
        if (possibleReplies.length === 0) {
            const final = userFiltered[0][0];
            setSequenceOver(true);
            setLastSequence(final);
            return true;
        }

        // Randomly pick a reply
        const replySan = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
        setTimeout(() => {
            game.move(replySan, { sloppy: true });
            setPosition(game.fen());
            setHistory(h => [...h, replySan]);
            const nextIdx = newIdx + 1;
            setIdx(nextIdx);
            // Filter candidates by replySan
            const post = userFiltered.filter(([, moves]) => moves[newIdx] === replySan);
            setCandidates(post);
            if (post.length === 1 && !post[0][1][nextIdx]) {
                autoComplete(post[0][1]);
                setSequenceOver(true);
                setLastSequence(post[0][0]);
            }
        }, 300);

        return true;
    };

    // Auto-complete remaining moves
    const autoComplete = (moves) => {
        for (let i = idx + 1; i < moves.length; i++) {
            try { game.move(moves[i], { sloppy: true }); } catch {}
        }
        setPosition(game.fen());
    };

    // Hint user moves
    const onHint = () => {
        const legal = game.moves({ verbose: true });
        const dests = [...new Set(legal.map(m => m.to))];
        setHintSquares(dests);
        setTimeout(() => setHintSquares([]), 1000);
    };

    // Possible user moves list
    const possibleMoves = game.moves();

    const customSquareStyles = {
        ...(shakeSq && { [shakeSq]: { animation: 'shake 0.5s ease' } }),
        ...hintSquares.reduce((s, sq) => ({ ...s, [sq]: { backgroundColor: 'rgba(0,255,0,0.4)' } }), {})
    };

    useEffect(initExplorer, []);

    return (
        <div className="explorer-container">
            <div className="explorer-sidebar">
                <h3>Candidates ({candidates.length})</h3>
                <ul>
                    {candidates.map(([name]) => <li key={name}>{name}</li>)}
                </ul>
                {/*<h3>Possible Moves</h3>*/}
                {/*<ul>*/}
                {/*    {possibleMoves.map(m => <li key={m}>{m}</li>)}*/}
                {/*</ul>*/}
                <h3>Move History</h3>
                <table className="history-table">
                    <tbody>
                    {Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => (
                        <tr key={i}>
                            <td>{`${i + 1}.`}</td>
                            <td>{history[2 * i] || ""}</td>
                            <td>{history[2 * i + 1] || ""}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

            </div>
            <div className="explorer-board">
                <div className="explorer-header">
                    <h2>{sequenceOver ? `Over: ${lastSequence}` : 'Explorer Mode'}</h2>
                    <div className="explorer-controls">
                        <button onClick={initExplorer}>Restart</button>
                        <button onClick={onHint}>Hint</button>
                    </div>
                </div>
                <Chessboard
                    position={position}
                    onPieceDrop={onPieceDrop}
                    customSquareStyles={customSquareStyles}
                    boardWidth={400}
                    boardOrientation="white"
                />
            </div>
        </div>
    );
}
