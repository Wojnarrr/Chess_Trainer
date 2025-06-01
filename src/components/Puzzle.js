// src/components/Puzzle.js
import React from 'react';
import { Chessboard } from 'react-chessboard';
import './Puzzle.css';

export default function Puzzle({
                                   puzzleOpening,
                                   puzzleIdx,
                                   position,
                                   onPieceDrop,
                                   customSquareStyles,
                                   onBack,
                                   onNewPuzzle,
                                   showHint,
                                   score
                               }) {
    return (
        <div className="puzzle-board">
            <div className="puzzle-header">
                <button onClick={onBack}>← Back</button>
                <h2>{puzzleOpening} – Move #{puzzleIdx + 1}</h2>
                <div className="puzzle-controls">
                    <button onClick={onNewPuzzle}>New Puzzle</button>
                    <button onClick={showHint}>Hint</button>
                    <span className="score">Score: {score}</span>
                </div>
            </div>
            <div className="puzzle-board-container">
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
