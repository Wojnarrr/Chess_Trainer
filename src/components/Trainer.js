import React from 'react';
import { Chessboard } from 'react-chessboard';

export default function Trainer({ moves, idx, onDrop, customStyles }) {
    return (
        <Chessboard
            position={/* managed in parent */}
            onPieceDrop={onDrop}
            customSquareStyles={customStyles}
            boardWidth={400}
        />
    );
}