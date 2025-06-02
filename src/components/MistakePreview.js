import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

export default function MistakePreview({ game, mistake, onClose }) {
    const [fen, setFen] = useState('');
    const [moveList, setMoveList] = useState([]);

    useEffect(() => {
        const chess = new Chess();
        chess.loadPgn(game.pgn);
        const allMoves = chess.history({ verbose: true });

        const startPly = Math.max(0, mistake.ply - 4);
        chess.reset();

        for (let i = 0; i < startPly; i++) {
            chess.move(allMoves[i], { sloppy: true });
        }

        setFen(chess.fen());

        const shownMoves = [];
        for (let i = startPly; i < mistake.ply; i++) {
            const move = allMoves[i];
            shownMoves.push({
                san: move.san,
                number: Math.floor(i / 2) + 1,
                color: i % 2 === 0 ? 'White' : 'Black'
            });
            chess.move(move);
        }

        setMoveList(shownMoves);
    }, [game, mistake]);

    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Chessboard boardWidth={400} position={fen} />
            <div>
                <h4>Moves before mistake:</h4>
                <ol>
                    {moveList.map((m, i) => (
                        <li key={i}>
                            {m.color} {m.number}. {m.san}
                        </li>
                    ))}
                </ol>
                <p>
                    <strong>Mistake:</strong> {mistake.actualSan} <br />
                    <strong>Engine’s best:</strong> {mistake.bestSan}
                </p>
                <button onClick={onClose}>Close Preview</button>
            </div>
        </div>
    );
}
