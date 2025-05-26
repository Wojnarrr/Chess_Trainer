// src/components/DifficultySelector.jsx
import React from 'react';

export default function DifficultySelector({ difficulty, onChange }) {
    return (
        <label>
            Difficulty:
            <select
                value={difficulty}
                onChange={e => onChange(e.target.value)}
                style={{ marginLeft: '0.5rem' }}
            >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
            </select>
        </label>
    );
}
