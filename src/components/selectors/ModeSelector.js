// src/components/ModeSelector.js
import React from 'react';
import '../../styles/SelectorGroup.css';

export default function ModeSelector({ mode, onChange }) {
    const MODES = ["Trainer", "Puzzle", "Explorer"];
    return (
        <div className="option-selector">
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
