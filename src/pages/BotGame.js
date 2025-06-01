// src/pages/BotGame.jsx
import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './BotGame.css';

const LEVELS = [1, 2, 3, 4, 5, 6];

export default function BotGame() {
    const [game, setGame] = useState(new Chess());
    const [position, setPosition] = useState('start');
    const [thinking, setThinking] = useState(false);
    const [difficulty, setDifficulty] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);

    const makeBotMove = async () => {
        setThinking(true);
        const fen = game.fen();
        const res = await fetch('http://localhost:4000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen, depth: selectedLevel * 2 })
        });
        const data = await res.json();

        if (data && data.bestMove) {
            const move = {
                from: data.bestMove.slice(0, 2),
                to: data.bestMove.slice(2, 4),
                promotion: 'q'
            };
            game.move(move);
            setPosition(game.fen());
        }
        setThinking(false);
    };

    const onDrop = (source, target) => {
        const move = game.move({ from: source, to: target, promotion: 'q' });
        if (move === null) return false;
        setPosition(game.fen());
        setTimeout(makeBotMove, 500);
        return true;
    };

    const startGame = (level) => {
        setDifficulty(level);
        setSelectedLevel(level);
        const newGame = new Chess();
        setGame(newGame);
        setPosition(newGame.fen());
    };

    const formatMoveHistory = () => {
        const history = game.history();
        const pairs = [];
        for (let i = 0; i < history.length; i += 2) {
            const white = history[i];
            const black = history[i + 1] || '';
            pairs.push(`${(i / 2) + 1}. ${white} ${black}`);
        }
        return pairs;
    };

    if (!selectedLevel) {
        return (
            <div className="bot-difficulty-page">
                <h2>Choose Difficulty</h2>
                <div className="card-grid">
                    {LEVELS.map(level => (
                        <div key={level} className="level-card">
                            <h3>Level {level}</h3>
                            {/* Wins/Losses would go here */}
                            <p>Wins: TBD</p>
                            <p>Losses: TBD</p>
                            <button onClick={() => startGame(level)}>Start</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bot-game-page">
            <h2>Bot Game – Level {selectedLevel}</h2>
            <div className="board-layout">
                <div className="move-list">
                    <h4>Moves</h4>
                    <ol>
                        {formatMoveHistory().map((move, idx) => (
                            <li key={idx}>{move}</li>
                        ))}
                    </ol>
                </div>
                <div className="board-container">
                    <Chessboard
                        position={position}
                        onPieceDrop={onDrop}
                        boardOrientation="white"
                        boardWidth={700}
                    />
                </div>
            </div>
            {thinking && <p>Bot is thinking...</p>}
        </div>
    );
}
