// src/components/Trainer.js
import React from 'react';
import { Chessboard } from 'react-chessboard';
import '../styles/Trainer.css';

export default function Trainer({
                                    selected,
                                    position,
                                    onPieceDrop,
                                    customSquareStyles,
                                    orientation,
                                    onBack,
                                    moveHistory = [],
                                    onPrev,
                                    onNext,
                                    canGoBack,
                                    canGoForward
                                }) {
    return (
        <div className="trainer-board">
            <div className="trainer-header">
                <button onClick={onBack}>← Back</button>
                <h2>{selected}</h2>
            </div>

            <div className="trainer-content">
                <div className="board-column">
                    <div className="styled-board-container">
                        <Chessboard
                            position={position}
                            onPieceDrop={onPieceDrop}
                            customSquareStyles={customSquareStyles}
                            boardWidth={400}
                            boardOrientation={orientation}
                        />
                    </div>
                    <div className="move-controls">
                        <button onClick={onPrev} disabled={!canGoBack}>← Previous</button>
                        <button onClick={onNext} disabled={!canGoForward}>Next →</button>
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
                        {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                            <tr key={i}>
                                <td>{i + 1}.</td>
                                <td>{moveHistory[i * 2] || ''}</td>
                                <td>{moveHistory[i * 2 + 1] || ''}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
