import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import '../styles/MistakePuzzle.css';

export default function MistakePuzzle() {
    const [puzzle, setPuzzle] = useState(null);
    const [fen, setFen] = useState('');
    const [chess, setChess] = useState(null);
    const [status, setStatus] = useState('');
    const [score, setScore] = useState(null);
    const [solutionShown, setSolutionShown] = useState(false);
    const [highlightSquares, setHighlightSquares] = useState({});
    const [totalScore, setTotalScore] = useState(0);
    const [orientation, setOrientation] = useState('white');
    const [shakeSq, setShakeSq] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    const loadPuzzle = async () => {
        setStatus('Loading puzzle...');
        setScore(null);
        setSolutionShown(false);
        setHighlightSquares({});
        try {
            const res = await fetch(`${API_URL}/api/puzzles/random`, {
                credentials: 'include'
            });
            if (!res.ok) {
                setStatus('No puzzle available.');
                return;
            }

            const data = await res.json();
            setPuzzle(data);

            const isWhite = data.ply % 2 === 1; // odd ply = white's move
            setOrientation(isWhite ? 'white' : 'black');
            const game = new Chess();
            game.loadPgn(data.pgn);
            const allMoves = game.history({ verbose: true });
            game.reset();

            const startPly = Math.max(0, data.ply - 4);
            for (let i = 0; i < startPly; i++) game.move(allMoves[i]);

            const replayMoves = [];
            for (let i = startPly; i < Math.min(startPly + 3, allMoves.length); i++) {
                const move = allMoves[i];
                game.move(move);
                replayMoves.push(move);
            }

            const mistakeMove = allMoves[data.ply - 1]; // the actual mistake
            if (mistakeMove) {
                setHighlightSquares({
                    [mistakeMove.from]: { background: 'rgba(255, 0, 0, 0.5)' },
                    [mistakeMove.to]: { background: 'rgba(255, 0, 0, 0.5)' },
                });
            }

            setFen(game.fen());
            setChess(new Chess(game.fen()));
            setStatus('Your move!');
        } catch (err) {
            console.error('[Puzzle] Error loading puzzle:', err);
            setStatus('Error loading puzzle');
        }
    };
    const handleShowBestMove = () => {
        setSolutionShown(true);
        if (puzzle.bestSan) {
            const game = new Chess(puzzle.fenBefore);
            const move = game.move(puzzle.bestSan, { sloppy: true });
            if (move) {
                setHighlightSquares((prev) => ({
                    ...prev,
                    [move.from]: { background: 'rgba(0, 255, 0, 0.5)' },
                    [move.to]: { background: 'rgba(0, 255, 0, 0.5)' },
                }));
            }
        }
    };
    useEffect(() => {
        loadPuzzle();
    }, []);

    const onDrop = async (sourceSquare, targetSquare) => {
        if (!chess || score !== null) return false;

        let move;
        try {
            move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
        } catch (e) {
            setShakeSq(sourceSquare);
            setTimeout(() => setShakeSq(null), 500);
            return false;
        }

        if (!move) {
            setShakeSq(sourceSquare);
            setTimeout(() => setShakeSq(null), 500);
            return false;
        }


        setFen(chess.fen());
        setStatus('Analyzing...');

        try {
            const res = await fetch(`${API_URL}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ fen: puzzle.fenBefore, actualSan: move.san })
            });

            const data = await res.json();
            const { evalBefore, evalAfter } = data;
            const mistakeEval = puzzle.evalAfter;

            const normalize = (rawEval) =>
                puzzle.fenBefore.includes(' w ') ? rawEval : -rawEval;

            const bestEval = normalize(puzzle.evalBefore);
            const userEval = normalize(evalAfter);
            const originalMistakeEval = normalize(puzzle.evalAfter);

            const evalDiff = Math.abs(bestEval - userEval);
            const mistakeDepth = Math.abs(bestEval - originalMistakeEval);

// Base score by distance from best move (linear decay)
            let baseScore;
            if (evalDiff <= 20) baseScore = 100;
            else if (evalDiff <= 60) baseScore = 80;
            else if (evalDiff <= 150) baseScore = 60;
            else if (evalDiff <= 300) baseScore = 40;
            else if (evalDiff <= 500) baseScore = 20;
            else baseScore = 0;

//  the *less* severe the original mistake, the *harsher* the grading
            const difficultyWeight = 1.0 - Math.min(mistakeDepth / 1000, 0.6);  // Caps at 40% penalty
            const finalScore = Math.round(baseScore * difficultyWeight);

// Feedback message
            let message;
            if (finalScore === 100) message = "Perfect move!";
            else if (finalScore >= 80) message = "Excellent choice!";
            else if (finalScore >= 60) message = "Good idea!";
            else if (finalScore >= 40) message = "Okay, but could be better.";
            else if (finalScore >= 20) message = "Not great. Better moves were available.";
            else message = "Incorrect. Try again!";

            if (finalScore === 0) {
                setScore(0);
                setStatus(message);
                setChess(new Chess(puzzle.fenBefore));
                setFen(puzzle.fenBefore);
                setTotalScore(0);
                return;
            }

            setScore(finalScore);
            setTotalScore(prev => prev + finalScore);
            setStatus(`${message} You scored ${finalScore} points.`);

        } catch (err) {
            console.error('[Puzzle] Error analyzing move:', err);
            setStatus('Error analyzing move');
        }

        return true;
    };

    if (!puzzle) return <div>{status}</div>;

    return (
        <div className="puzzle-board">
            <div className="puzzle-header">
                <h2>Mistake Puzzle </h2>
                <h2>Find a better move than – {puzzle.actualSan}</h2>
                <div className="puzzle-controls">
                    {score !== null && !solutionShown && (
                        <button onClick={handleShowBestMove}>Show Best Move</button>
                    )}
                    {score !== null && solutionShown && (
                        <p><strong>Engine's Best:</strong> {puzzle.bestSan}</p>
                    )}
                    {score !== null && <button onClick={loadPuzzle}>Next Puzzle</button>}
                    <span className="score">Score: {totalScore}</span>
                </div>
            </div>

            <div className="puzzle-board-container">
                <div className="styled-board-container">
                    <Chessboard
                        position={fen}
                        onPieceDrop={onDrop}
                        boardWidth={400}
                        customSquareStyles={{
                            ...highlightSquares,
                            ...(shakeSq && { [shakeSq]: { animation: 'shake 0.5s ease' } })
                        }}
                        boardOrientation={orientation}
                    />
                </div>
                <p className="status-message">{status}</p>
            </div>
        </div>
    );

}
