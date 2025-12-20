import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import '../styles/Explorer.css';

export default function Explorer({ openingMap }) {
    const [game] = useState(() => new Chess());
    const [position, setPosition] = useState(game.fen());
    const [candidates, setCandidates] = useState([]); // [[name, moves], ...]
    const [history, setHistory] = useState([]);
    const [idx, setIdx] = useState(0);
    const [shakeSq, setShakeSq] = useState(null);
    const [hintSquares, setHintSquares] = useState([]);
    const [sequenceOver, setSequenceOver] = useState(false);
    const [lastSequence, setLastSequence] = useState(null);
    const [activeCandidates, setActiveCandidates] = useState(new Set());

    useEffect(() => {
        const all = Object.keys(openingMap);
        setActiveCandidates(new Set(all));
    }, [openingMap]);


    const initExplorer = () => {
        game.reset();
        setPosition(game.fen());
        const filtered = Object.entries(openingMap).filter(([name]) => activeCandidates.has(name));
        setCandidates(filtered);
        setHistory([]);
        setIdx(0);
        setShakeSq(null);
        setHintSquares([]);
        setSequenceOver(false);
        setLastSequence(null);
    };


    const onPieceDrop = (source, target) => {
        if (sequenceOver) return false;

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

        const userFiltered = candidates.filter(([, moves]) => moves[idx] === san);
        if (userFiltered.length === 0) {
            setShakeSq(source);
            setTimeout(() => setShakeSq(null), 500);
            return false;
        }

        game.move({ from: source, to: target, promotion: 'q' });
        setPosition(game.fen());
        setHistory(h => [...h, san]);
        const newIdx = idx + 1;
        setIdx(newIdx);
        setCandidates(userFiltered);

        const possibleReplies = [...new Set(
            userFiltered.map(([, moves]) => moves[newIdx]).filter(Boolean)
        )];
        if (possibleReplies.length === 0) {
            const final = userFiltered[0][0];
            setSequenceOver(true);
            setLastSequence(final);
            return true;
        }

        const replySan = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
        setTimeout(() => {
            game.move(replySan, { sloppy: true });
            setPosition(game.fen());
            setHistory(h => [...h, replySan]);
            const nextIdx = newIdx + 1;
            setIdx(nextIdx);
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

    const autoComplete = (moves) => {
        for (let i = idx + 1; i < moves.length; i++) {
            try { game.move(moves[i], { sloppy: true }); } catch {}
        }
        setPosition(game.fen());
    };

    const onHint = () => {
        const expectedSANs = [...new Set(
            candidates.map(([, moves]) => moves[idx]).filter(Boolean)
        )];

        const legalMoves = game.moves({ verbose: true });
        const dests = legalMoves
            .filter(m => expectedSANs.includes(m.san))
            .map(m => m.to);

        setHintSquares([...new Set(dests)]);
        setTimeout(() => setHintSquares([]), 1000);
    };

    const toggleCandidate = (name) => {
        setActiveCandidates(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const customSquareStyles = {
        ...(shakeSq && { [shakeSq]: { animation: 'shake 0.5s ease' } }),
        ...hintSquares.reduce((s, sq) => ({ ...s, [sq]: { backgroundColor: 'rgba(0,255,0,0.4)' } }), {})
    };

    useEffect(() => {
        initExplorer();
    }, [activeCandidates]);

    return (
        <div className="trainer-board">
            <div className="trainer-header">
                <button onClick={initExplorer}>↺ Restart</button>
                <h2>{sequenceOver ? `Over: ${lastSequence}` : 'Explorer Mode'}</h2>
                <button onClick={onHint}>Hint</button>
            </div>

            <div className="trainer-content">
                <div className="board-history-row">
                    <div className="board-column">
                        <div className="styled-board-container">
                            <Chessboard
                                position={position}
                                onPieceDrop={onPieceDrop}
                                customSquareStyles={customSquareStyles}
                                boardWidth={400}
                            />
                        </div>
                    </div>
                    <div className="candidate-box">
                        <h4>Candidate Openings ({Object.keys(openingMap).length})</h4>
                        <div className="candidate-toggle-list">
                            {Object.keys(openingMap).map(name => (
                                <label key={name}>
                                    <input
                                        type="checkbox"
                                        checked={activeCandidates.has(name)}
                                        onChange={() => toggleCandidate(name)}
                                    />
                                    {name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="move-history-box">
                    <h4>Move History</h4>
                    <table className="move-history-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>White</th>
                            <th>Black</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                            <tr key={i}>
                                <td>{i + 1}.</td>
                                <td>{history[i * 2] || ''}</td>
                                <td>{history[i * 2 + 1] || ''}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>


        </div>
    );
}
