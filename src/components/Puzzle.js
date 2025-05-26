import React from 'react';
import { Chessboard } from 'react-chessboard';

export default function Puzzle({ position, onDrop, customStyles }) {
    return (
        <Chessboard
            position={position}
            onPieceDrop={onDrop}
            customSquareStyles={customStyles}
            boardWidth={400}
        />
    );
}