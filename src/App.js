import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { OPENINGS } from "./openings";
import "./App.css";

export default function App() {
    const [game] = useState(() => new Chess());
    const [position, setPosition] = useState(game.fen());

    // Opening trainer state
    const [selected, setSelected] = useState("");
    const [moves, setMoves] = useState([]);        // array of SAN strings
    const [idx, setIdx] = useState(0);             // next move index
    const [highlight, setHighlight] = useState({   // squares to highlight
        from: null,
        to: null,
    });

    // When user picks an opening
    const onSelect = (e) => {
        const name = e.target.value;
        setSelected(name);
        setMoves(name ? OPENINGS[name] : []);
        resetTrainer();
    };

    // Reset board + trainer position
    const resetTrainer = () => {
        game.reset();
        setPosition(game.fen());
        setIdx(0);
        setHighlight({ from: null, to: null });
    };

    // Advance one move in the opening
    const nextMove = () => {
        if (idx >= moves.length) return;
        // let chess.js parse SAN (sloppy allows minimal notation)
        const m = game.move(moves[idx], { sloppy: true });
        if (!m) return; // SAN parse failed
        setPosition(game.fen());
        setHighlight({ from: m.from, to: m.to });
        setIdx(idx + 1);
    };

    // Optional: go back one move
    const prevMove = () => {
        if (idx === 0) return;
        game.undo();            // undo last move
        const last = moves[idx - 1];
        // to highlight the undone move, re-simulate it but don't advance idx
        const temp = new Chess();
        for (let i = 0; i < idx - 1; i++) temp.move(moves[i], { sloppy: true });
        const m = temp.move(last, { sloppy: true });
        setPosition(game.fen());
        setHighlight(m ? { from: m.from, to: m.to } : { from: null, to: null });
        setIdx(idx - 1);
    };

    // Combine any shake or highlight styles
    const customSquareStyles = {
        ...(highlight.from && {
            [highlight.from]: { backgroundColor: "rgba(255,255,0,0.5)" },
        }),
        ...(highlight.to && {
            [highlight.to]: { backgroundColor: "rgba(255,255,0,0.5)" },
        }),
    };

    return (
        <div className="app">
            <h1>Chess Opening Trainer</h1>

            <div className="controls">
                <select value={selected} onChange={onSelect}>
                    <option value="">— Select an opening —</option>
                    {Object.keys(OPENINGS).map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>

                <button onClick={resetTrainer} disabled={!selected}>
                    Reset
                </button>
                <button onClick={prevMove} disabled={idx === 0}>
                    ◀ Prev
                </button>
                <button onClick={nextMove} disabled={idx >= moves.length}>
                    Next ▶
                </button>
            </div>

            <div className="board-container">
                <Chessboard
                    position={position}
                    boardWidth={400}
                    customSquareStyles={customSquareStyles}
                    // optionally disable user moves in trainer mode:
                    onPieceDrop={() => false}
                />
            </div>
        </div>
    );
}
