// src/components/DifficultySelector.js
import React from 'react';
import '../../styles/SelectorGroup.css';

export default function DifficultySelector({ difficulty, onChange }) {
    const LEVELS = ["Beginner", "Intermediate", "Expert"];
    return (
        <div className="option-selector">
            {LEVELS.map((level) => (
                <button
                    key={level}
                    className={difficulty === level ? 'active' : ''}
                    onClick={() => onChange(level)}
                >
                    {level}
                </button>
            ))}
        </div>
    );
}
