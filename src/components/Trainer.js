// src/components/Trainer.jsx
import React from 'react';
import { Chessboard } from 'react-chessboard';
import './Trainer.css';

export default function Trainer({
                                    selected,
                                    position,
                                    onPieceDrop,
                                    customSquareStyles,
                                    orientation,
                                    onBack
                                }) {
    return (
        <div className="trainer-board">
            <div className="trainer-header">
                <button onClick={onBack}>← Back</button>
                <h2>{selected}</h2>
            </div>
            <Chessboard
                position={position}
                onPieceDrop={onPieceDrop}
                customSquareStyles={customSquareStyles}
                boardWidth={400}
                boardOrientation={orientation}
            />
        </div>
    );
}
