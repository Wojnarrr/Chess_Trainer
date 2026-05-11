// src/components/SideSelector.js
import React from 'react';
import '../../styles/SelectorGroup.css';

export default function SideSelector({ side, onChange }) {
    const OPTIONS = ["White", "Black"];
    return (
        <div className="option-selector">
            {OPTIONS.map((opt) => (
                <button
                    key={opt}
                    className={side === opt ? 'active' : ''}
                    onClick={() => onChange(opt)}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
