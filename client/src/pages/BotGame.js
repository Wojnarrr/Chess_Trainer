import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import '../styles/BotGame.css';

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export default function BotGame() {
    const [game, setGame] = useState(new Chess());
    const [position, setPosition] = useState('start');
    const [thinking, setThinking] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [playAsWhite, setPlayAsWhite] = useState(true);
    const [historyIndex, setHistoryIndex] = useState(null);
    const [shakeSq, setShakeSq] = useState(null);

    const startGame = (level) => {
        setSelectedLevel(level);
        const newGame = new Chess();
        setGame(newGame);
        setPosition(newGame.fen());
        setHistoryIndex(null);


        if (!playAsWhite) {  // If playing as black, make the bot's first move
            setTimeout(() => makeBotMoveWithFen(newGame, newGame.fen(), level), 500);
        }
    };

    const resetGame = () => {
        setSelectedLevel(null);
        setGame(new Chess());
        setPosition('start');
        setThinking(false);
        setHistoryIndex(null);
    };

    const makeBotMove = async () => {
        if (historyIndex !== null) return; // don't move during history view
        setThinking(true);
        const fen = game.fen();
        const res = await fetch('http://localhost:4000/api/analyze/botmove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen, level: selectedLevel })
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

    // Make bot move with a specific FEN, useful for initial bot move
    const makeBotMoveWithFen = async (gameInstance, fen, level) => {
        setThinking(true);
        const res = await fetch('http://localhost:4000/api/analyze/botmove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen, level })
        });
        const data = await res.json();

        if (data && data.bestMove) {
            const move = {
                from: data.bestMove.slice(0, 2),
                to: data.bestMove.slice(2, 4),
                promotion: 'q'
            };
            gameInstance.move(move);
            const newGame = new Chess();
            newGame.loadPgn(gameInstance.pgn()); // preserve move history
            setGame(newGame);
            setPosition(newGame.fen());
        }
        setThinking(false);
    };

    // Handle piece drop on the board
    const onDrop = (source, target) => {
        if (historyIndex !== null) return false;

        try {
            game.move({ from: source, to: target, promotion: 'q' });
        } catch (e) {
            // Invalid move – trigger shake
            setShakeSq(source);
            setTimeout(() => setShakeSq(null), 500);
            return false;
        }

        setPosition(game.fen());
        setTimeout(makeBotMove, 500);
        return true;
    };



    const formatMoveHistory = () => {
        const history = game.history();
        const rows = [];
        for (let i = 0; i < history.length; i += 2) {
            rows.push({ move: i / 2 + 1, white: history[i], black: history[i + 1] || '' });
        }
        return rows;
    };

    const onPrev = () => {
        const current = historyIndex === null ? game.history().length - 1 : historyIndex;
        setHistoryIndex(Math.max(0, current - 1));
    };

    const onNext = () => {
        if (historyIndex === null) return;
        const max = game.history().length - 1;
        if (historyIndex >= max) return setHistoryIndex(null);
        setHistoryIndex(historyIndex + 1);
    };

    const getHighlightStyles = () => {
        const moves = game.history({ verbose: true });
        const move = moves[historyIndex === null ? moves.length - 1 : historyIndex];
        if (!move) return {};
        return {
            [move.from]: { backgroundColor: 'rgba(255, 255, 0, 0.5)' },
            [move.to]: { backgroundColor: 'rgba(255, 255, 0, 0.5)' }
        };
    };

    const currentFen = () => {
        if (historyIndex === null) return game.fen();
        const temp = new Chess();
        const history = game.history({ verbose: true });
        for (let i = 0; i <= historyIndex; i++) {
            temp.move(history[i]);
        }
        return temp.fen();
    };

    if (!selectedLevel) {
        return (
            <div className="bot-difficulty-page">
                <h2>Choose Difficulty</h2>
                <div className="color-toggle">
                    <button
                        className={playAsWhite ? 'active' : ''}
                        onClick={() => setPlayAsWhite(true)}
                    >
                        White
                    </button>
                    <button
                        className={!playAsWhite ? 'active' : ''}
                        onClick={() => setPlayAsWhite(false)}
                    >
                        Black
                    </button>
                </div>

                <div className="card-grid">
                    {LEVELS.map(level => {
                        const elo = 200 + (level - 1) * 200;
                        return (
                            <div key={level} className="level-card">
                                <h3>Level {level}</h3>
                                <p>Elo: {elo}</p>

                                <button onClick={() => startGame(level)}>Start</button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="bot-game-page">
            <h2>Bot Game – Level {selectedLevel} ({playAsWhite ? 'White' : 'Black'})</h2>

            <button className="back-button" onClick={resetGame}>
                ⬅ Back to Difficulty Selection
            </button>

            <div className="trainer-content">
                <div className="board-column">
                    <div className="styled-board-container">
                        <Chessboard
                            position={currentFen()}
                            onPieceDrop={onDrop}
                            boardOrientation={playAsWhite ? 'white' : 'black'}
                            boardWidth={400}
                            customSquareStyles={{
                                ...getHighlightStyles(),
                                ...(shakeSq && { [shakeSq]: { animation: 'shake 0.5s ease' } })
                            }}
                        />
                    </div>
                    <div className="move-controls">
                        <button onClick={onPrev} disabled={game.history().length === 0 || historyIndex === 0}>
                            ← Previous
                        </button>
                        <button onClick={onNext} disabled={historyIndex === null}>
                            Next →
                        </button>
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
                        {formatMoveHistory().map((row, i) => (
                            <tr key={i}>
                                <td>{row.move}.</td>
                                <td>{row.white}</td>
                                <td>{row.black}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {thinking && <p>Bot is thinking...</p>}
        </div>
    );
}
