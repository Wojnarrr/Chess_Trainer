// src/components/ModeSelector.js
import React from 'react';
import './ModeSelector.css';

export default function ModeSelector({ mode, onChange }) {
    const MODES = ["Trainer", "Puzzle", "Explorer"];
    return (
        <div className="mode-selector">
            {MODES.map((m) => (
                <button
                    key={m}
                    className={mode === m ? 'active' : ''}
                    onClick={() => onChange(m)}
                >
                    {m}
                </button>
            ))}
        </div>
    );
}
