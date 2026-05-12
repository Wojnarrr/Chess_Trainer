// src/pages/OpeningsPage.jsx
import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { OPENINGS } from "../openings";
import ModeSelector from '../components/selectors/ModeSelector';
import SideSelector from '../components/selectors/SideSelector';
import DifficultySelector from '../components/selectors/DifficultySelector';
import OpeningSelector from '../components/selectors/OpeningSelector';
import Trainer from "../components/Trainer";
import Puzzle from "../components/Puzzle";
import Explorer from '../components/Explorer';

const DIFFICULTY_LIVES = {
    Beginner: Infinity,
    Intermediate: 3,
    Expert: 1,
};

export default function OpeningsPage() {
    const [game] = useState(() => new Chess());
    const [position, setPosition] = useState(game.fen());
    const [side, setSide] = useState("White");

    const [mode, setMode] = useState("Trainer");
    const [difficulty, setDifficulty] = useState("Beginner");
    const [lives, setLives] = useState(DIFFICULTY_LIVES[difficulty]);
    const [gameOver, setGameOver] = useState(false);
    const [shakeSq, setShakeSq] = useState(null);
    const [highlight, setHighlight] = useState({ from: null, to: null });
    const [awaitingBlack, setAwaitingBlack] = useState(false);
    const [moveHistory, setMoveHistory] = useState([]);

    const [selected, setSelected] = useState("");
    const [moves, setMoves] = useState([]);
    const [idx, setIdx] = useState(0);

    const [puzzleOpening, setPuzzleOpening] = useState("");
    const [puzzleIdx, setPuzzleIdx] = useState(0);
    const [expectedMove, setExpectedMove] = useState(null);
    const [score, setScore] = useState(0);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    useEffect(() => {
        setLives(DIFFICULTY_LIVES[difficulty]);
    }, [difficulty]);

    useEffect(() => {
        if (mode === "Trainer") initTrainer();
        else if (mode === "Puzzle") initPuzzle();
    }, [mode]);

    useEffect(() => {
        if (mode !== "Trainer") return;
        const userTurn = (side === "White" && idx % 2 === 0) || (side === "Black" && idx % 2 === 1);
        if (idx < moves.length && userTurn) {
            const temp = new Chess();
            for (let i = 0; i < idx; i++) try { temp.move(moves[i]); } catch {}
            let next = null;
            try { next = temp.move(moves[idx]); } catch {}
            if (next) {
                if (difficulty === "Beginner") setHighlight({ from: next.from, to: next.to });
                else if (difficulty === "Intermediate") setHighlight({ from: next.from, to: null });
            } else {
                setHighlight({ from: null, to: null });
            }
        } else {
            setHighlight({ from: null, to: null });
        }
    }, [moves, idx, difficulty, mode]);

    function initTrainer(opening = selected) {
        const arr = opening ? OPENINGS[opening] : [];
        setSelected(opening);
        setMoves(arr);
        game.reset();
        setPosition(game.fen());
        setIdx(0);
        if (side === "Black" && arr.length) {
            game.move(arr[0], { sloppy: true });
            setPosition(game.fen());
            setIdx(1);
        }
        setGameOver(false);
        setShakeSq(null);
        setHighlight({ from: null, to: null });
        setAwaitingBlack(false);
    }

    function initPuzzle() {
        const names = Object.keys(OPENINGS);
        const openingName = names[Math.floor(Math.random() * names.length)];
        const sans = OPENINGS[openingName];
        const whiteMoves = sans.map((_, i) => i).filter(i => i % 2 === 0);
        const randIdx = whiteMoves[Math.floor(Math.random() * whiteMoves.length)];
        const temp = new Chess();
        for (let i = 0; i < randIdx; i++) try { temp.move(sans[i], { sloppy: true }); } catch {}
        const fen = temp.fen();
        const temp2 = new Chess(fen);
        const exp = temp2.move(sans[randIdx], { sloppy: true });
        game.reset();
        game.load(fen);
        setPosition(fen);
        setPuzzleOpening(openingName);
        setPuzzleIdx(randIdx);
        setExpectedMove(exp);
        setScore(0);
        setGameOver(false);
        setShakeSq(null);
        setHighlight({ from: null, to: null });
    }

    const customSquareStyles = {
        ...(shakeSq && { [shakeSq]: { animation: "shake 0.5s ease" } }),
        ...(highlight.from && { [highlight.from]: { backgroundColor: "rgba(255,255,0,0.5)" } }),
        ...(highlight.to && { [highlight.to]: { backgroundColor: "rgba(255,255,0,0.5)" } }),
    };

    const showHint = () => {
        if (mode === "Puzzle" && expectedMove) {
            setHighlight({ from: expectedMove.from, to: null });
            setTimeout(() => setHighlight({ from: null, to: null }), 1000);
        }
    };
    const replayToIndex = (targetIdx) => {
        const temp = new Chess();
        for (let i = 0; i < targetIdx; i++) {
            try { temp.move(moves[i]); } catch {}
        }
        game.reset();
        for (let i = 0; i < targetIdx; i++) {
            try { game.move(moves[i]); } catch {}
        }
        setPosition(temp.fen());
        setIdx(targetIdx);
        setHighlight({ from: null, to: null });
    };

    const onPieceDrop = (source, target) => {
        if (gameOver) return false;
        if (mode === "Trainer") {
            // Trainer logic
            if (mode === "Trainer") {
                // Only allow a drop when it's the user’s turn:
                const isUsersTurn =
                    (side === "White" && idx % 2 === 0) ||
                    (side === "Black" && idx % 2 === 1);
                if (!selected || awaitingBlack || !isUsersTurn || idx >= moves.length)
                    return false;
            }

            const temp = new Chess();
            for (let i = 0; i < idx; i++) try { temp.move(moves[i]); } catch {};
            let exp = null;
            try { exp = temp.move(moves[idx]); } catch {}
            if (!exp || exp.from !== source || exp.to !== target) {
                setShakeSq(source);
                setTimeout(() => setShakeSq(null), 500);
                if (difficulty !== "Beginner") {
                    setLives(l => {
                        const n = l - 1;
                        if (n <= 0) setGameOver(true);
                        return n;
                    });
                }
                return false;
            }
            game.move({ from: exp.from, to: exp.to, ...(exp.promotion && { promotion: exp.promotion }) });
            setPosition(game.fen());
            setMoveHistory([...game.history()]);
            const wIdx = idx;
            setIdx(wIdx + 1);
            setHighlight({ from: null, to: null });
            setAwaitingBlack(true);
            setTimeout(() => {
                const bIdx = wIdx + 1;
                if (bIdx < moves.length) {
                    const temp3 = new Chess();
                    for (let i = 0; i < bIdx; i++) try { temp3.move(moves[i]); } catch {};
                    const reply = temp3.move(moves[bIdx]);
                    if (reply) {
                        game.move({ from: reply.from, to: reply.to, ...(reply.promotion && { promotion: reply.promotion }) });
                        setPosition(game.fen());
                        setMoveHistory([...game.history()]);
                        setIdx(prev => prev + 1);
                    }
                }
                setAwaitingBlack(false);
            }, 300);
            return true;
        }

        // Puzzle logic
        if (!expectedMove) return false;
        if (source !== expectedMove.from || target !== expectedMove.to) {
            setShakeSq(source);
            setTimeout(() => setShakeSq(null), 500);
            if (difficulty !== "Beginner") {
                setLives(l => {
                    const n = l - 1;
                    if (n <= 0) setGameOver(true);
                    return n;
                });
            }
            game.move({ from: expectedMove.from, to: expectedMove.to, ...(expectedMove.promotion && { promotion: expectedMove.promotion }) });
            setPosition(game.fen());
            return false;
        }
        setScore(s => s + 1);
        game.move({ from: expectedMove.from, to: expectedMove.to, ...(expectedMove.promotion && { promotion: expectedMove.promotion }) });
        setPosition(game.fen());
        setTimeout(initPuzzle, 600);
        return true;
    };
    return (
        <div className="app">
            <h1>Openings Training</h1>

            <div className="openings-controls-box">
                <ModeSelector mode={mode} onChange={setMode} />
                {mode === "Trainer" && !selected && (
                    <>
                        <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
                        <SideSelector side={side} onChange={setSide} />
                    </>
                )}
            </div>

            {mode === "Trainer" && !selected && (
                <OpeningSelector selected={selected} onSelect={initTrainer} />
            )}

            {mode === "Trainer" && selected && (
                <Trainer
                    selected={selected}
                    position={position}
                    onPieceDrop={onPieceDrop}
                    customSquareStyles={customSquareStyles}
                    orientation={side.toLowerCase()}
                    onBack={() => initTrainer("")}
                    moveHistory={game.history()}
                    onPrev={() => replayToIndex(idx - 1)}
                    onNext={() => replayToIndex(idx + 1)}
                    canGoBack={difficulty === "Beginner" && idx > 0}
                    canGoForward={difficulty === "Beginner" && idx < moves.length}
                />
            )}

            {mode === "Puzzle" && puzzleOpening && (
                <Puzzle
                    puzzleOpening={puzzleOpening}
                    puzzleIdx={puzzleIdx}
                    position={position}
                    onPieceDrop={onPieceDrop}
                    customSquareStyles={customSquareStyles}
                    onBack={() => setPuzzleOpening("")}
                    onNewPuzzle={initPuzzle}
                    showHint={showHint}
                    score={score}
                    orientation={side.toLowerCase()}
                />
            )}

            {mode === "Explorer" && (
                <Explorer
                    openingMap={OPENINGS}
                    onBack={() => setMode("Trainer")}
                />
            )}
        </div>
    );

}
