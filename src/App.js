import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { OPENINGS } from "./openings";
import OpeningsList from "./components/OpeningsList";
import "./App.css";

const DIFFICULTY_LIVES = {
    Beginner: Infinity,
    Intermediate: 3,
    Expert: 1,
};
const DIFFICULTIES = Object.keys(DIFFICULTY_LIVES);

export default function App() {
    const [game] = useState(() => new Chess());
    const [position, setPosition] = useState(game.fen());

    const [selected, setSelected] = useState("");
    const [moves, setMoves] = useState([]);        // SAN strings
    const [idx, setIdx] = useState(0);             // next move index
    const [difficulty, setDifficulty] = useState("Beginner");
    const [lives, setLives] = useState(DIFFICULTY_LIVES.Beginner);
    const [gameOver, setGameOver] = useState(false);
    const [shakeSq, setShakeSq] = useState(null);
    const [highlight, setHighlight] = useState({ from: null, to: null });
    const [awaitingBlack, setAwaitingBlack] = useState(false);

    // HINT EFFECT
    useEffect(() => {
        console.log("[DEBUG] useEffect hint effect: idx=", idx, "difficulty=", difficulty);
        if (idx < moves.length && idx % 2 === 0) {
            const temp = new Chess();
            for (let i = 0; i < idx; i++) {
                try { temp.move(moves[i]); } catch {}
            }
            let next = null;
            try { next = temp.move(moves[idx]); } catch {}
            console.log("[DEBUG] Next SAN=", moves[idx], "parsed to", next);
            if (next) {
                if (difficulty === "Beginner") {
                    setHighlight({ from: next.from, to: next.to });
                } else if (difficulty === "Intermediate") {
                    setHighlight({ from: next.from, to: null });
                }
            } else {
                setHighlight({ from: null, to: null });
            }
        } else {
            setHighlight({ from: null, to: null });
        }
    }, [moves, idx, difficulty]);

    // Reset logic
    const resetState = (openingName = selected, diff = difficulty) => {
        console.log("[DEBUG] resetState: opening=", openingName, "difficulty=", diff);
        setSelected(openingName);
        setMoves(openingName ? OPENINGS[openingName] : []);
        game.reset();
        setPosition(game.fen());
        setIdx(0);
        setShakeSq(null);
        setGameOver(false);
        setDifficulty(diff);
        setLives(DIFFICULTY_LIVES[diff]);
        setAwaitingBlack(false);
    };

    const handleOpeningSelect = name => {
        console.log("[DEBUG] Opening selected: ", name);
        resetState(name, difficulty);
    };
    const handleDifficultyChange = e => {
        console.log("[DEBUG] Difficulty changed to: ", e.target.value);
        resetState(selected, e.target.value);
    };

    // Handle White's move
    const onPieceDrop = (source, target) => {
        console.log("[DEBUG] onPieceDrop called: source=", source, "target=", target,
            "idx=", idx, "awaitingBlack=", awaitingBlack, "gameOver=", gameOver);
        if (gameOver || !selected || awaitingBlack || idx % 2 !== 0 || idx >= moves.length) {
            console.log("[DEBUG] Drop rejected by state checks");
            return false;
        }

        // Compute expected move using fresh initial board
        const temp = new Chess();
        for (let i = 0; i < idx; i++) {
            try { temp.move(moves[i]); } catch {}
        }
        let expected = null;
        try { expected = temp.move(moves[idx]); } catch {}
        console.log("[DEBUG] Expected move: SAN=", moves[idx], "parsed=", expected);

        if (!expected || expected.from !== source || expected.to !== target) {
            console.log("[DEBUG] Wrong drop: expected from ", expected?.from, "to ", expected?.to);
            setShakeSq(source);
            setTimeout(() => setShakeSq(null), 500);
            if (difficulty !== "Beginner") {
                setLives(prev => {
                    const next = prev - 1;
                    console.log("[DEBUG] Lose life, lives now=", next);
                    if (next <= 0) {
                        console.log("[DEBUG] Game Over triggered");
                        setGameOver(true);
                    }
                    return next;
                });
            }
            return false;
        }

        console.log("[DEBUG] Correct drop, applying White move");
        try {
            game.move({ from: expected.from, to: expected.to, ...(expected.promotion && { promotion: expected.promotion }) });
        } catch (e) {
            console.error("[DEBUG] Error applying White move:", e);
        }
        setPosition(game.fen());

        const whiteIdx = idx;
        setIdx(whiteIdx + 1);
        setHighlight({ from: null, to: null });
        setAwaitingBlack(true);

        // Auto Black reply after delay
        setTimeout(() => {
            const blackIdx = whiteIdx + 1;
            let reply = null;
            if (blackIdx < moves.length) {
                const temp2 = new Chess();
                for (let i = 0; i < blackIdx; i++) {
                    try { temp2.move(moves[i]); } catch {}
                }
                try { reply = temp2.move(moves[blackIdx]); } catch {}
                console.log("[DEBUG] Black reply expected SAN=", moves[blackIdx], "parsed=", reply);
                if (reply) {
                    try {
                        game.move({ from: reply.from, to: reply.to, ...(reply.promotion && { promotion: reply.promotion }) });
                    } catch (e) {
                        console.error("[DEBUG] Error applying Black move:", e);
                    }
                    setPosition(game.fen());
                    setIdx(whiteIdx + 2);
                }
            }
            setAwaitingBlack(false);
        }, 300);

        return true;
    };

    const customSquareStyles = {
        ...(shakeSq && { [shakeSq]: { animation: "shake 0.5s ease" } }),
        ...(highlight.from && { [highlight.from]: { backgroundColor: "rgba(255,255,0,0.5)" } }),
        ...(highlight.to && { [highlight.to]: { backgroundColor: "rgba(255,255,0,0.5)" } }),
    };

    return (
        <div className="app">
            <h1>Interactive Opening Trainer</h1>
            <OpeningsList onSelect={handleOpeningSelect} />
            <div className="controls">
                <select value={difficulty} onChange={handleDifficultyChange}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selected} onChange={e => handleOpeningSelect(e.target.value)}>
                    <option value="">— pick an opening —</option>
                    {Object.keys(OPENINGS).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <button onClick={() => resetState(selected, difficulty)} disabled={!selected}>Reset</button>
            </div>
            <div className="status">
                {difficulty !== "Beginner" && <span>Lives: {lives === Infinity ? '∞' : lives}</span>}
                {gameOver && <span className="game-over">Game Over</span>}
            </div>
            <div className="board-container">
                <Chessboard
                    position={position}
                    onPieceDrop={onPieceDrop}
                    customSquareStyles={customSquareStyles}
                    boardWidth={400}
                />
            </div>
        </div>
    );
}
