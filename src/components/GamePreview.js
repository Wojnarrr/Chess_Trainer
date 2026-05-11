import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import '../styles/Trainer.css';

export default function GameViewer({ game, mistakeList = [], onClose }) {
    const [chess] = useState(new Chess());
    const [currentPly, setCurrentPly] = useState(0);
    const [history, setHistory] = useState([]);
    const [mistakePlies, setMistakePlies] = useState(new Set());

    useEffect(() => {
        if (!game || !game.pgn) return;

        const cleaned = game.pgn.replace(/\{[^}]*\}/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/\d+\.\.\./g, '')
            .replace(/\s+/g, ' ')
            .replace(/(\d+)\. /g, '$1.');

        chess.reset();
        chess.loadPgn(cleaned);

        setHistory(chess.history({ verbose: true }));
        setCurrentPly(0);

        const mistakeSet = new Set(mistakeList.map(m => m.ply));
        setMistakePlies(mistakeSet);
    }, [game, mistakeList]);

    const goToMove = (ply) => {
        chess.reset();
        for (let i = 0; i < ply; i++) {
            chess.move(history[i]);
        }
        setCurrentPly(ply);
    };

    const nextMove = () => {
        if (currentPly < history.length) {
            goToMove(currentPly + 1);
        }
    };

    const prevMove = () => {
        if (currentPly > 0) {
            goToMove(currentPly - 1);
        }
    };

    const currentMistake = mistakeList.find(m => m.ply === currentPly);

    return (
        <div className="trainer-board">
            <div className="trainer-header">
                <button onClick={onClose}>← Back</button>
                <h2>Game Viewer</h2>
            </div>

            <div className="trainer-content">
                <div className="board-column">
                    <div className="styled-board-container">
                        <Chessboard
                            position={chess.fen()}
                            arePiecesDraggable={false}
                            boardWidth={400}
                        />
                    </div>
                    <div className="move-controls">
                        <button onClick={prevMove} disabled={currentPly === 0}>← Previous</button>
                        <button onClick={nextMove} disabled={currentPly >= history.length}>Next →</button>
                    </div>
                    {currentMistake && (
                        <div className="mistake-info">
                            <strong>Mistake on move {currentMistake.moveNumber}:</strong><br />
                            Played <code>{currentMistake.actualSan}</code>, best was <code>{currentMistake.bestSan}</code><br />
                            Eval drop: {currentMistake.evalDrop}cp
                        </div>
                    )}
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
                                <td
                                    className={`${
                                        mistakePlies.has(i * 2 + 1) ? 'mistake' : ''  
                                    } ${
                                        currentPly === i * 2 + 1 ? 'current' : ''
                                    }`}
                                    onClick={() => goToMove(i * 2 + 1)}
                                >
                                    {history[i * 2]?.san || ''}
                                    {mistakePlies.has(i * 2 + 1) && <span title="Mistake"> ⚠️</span>}
                                </td>
                                <td
                                    className={`${
                                        mistakePlies.has(i * 2 + 2) ? 'mistake' : ''
                                    } ${
                                        currentPly === i * 2 + 2 ? 'current' : ''
                                    }`}
                                    onClick={() => goToMove(i * 2 + 2)}
                                >
                                    {history[i * 2 + 1]?.san || ''}
                                    {mistakePlies.has(i * 2 + 2) && <span title="Mistake"> ⚠️</span>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
