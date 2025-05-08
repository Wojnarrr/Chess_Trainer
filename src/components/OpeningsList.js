// src/components/OpeningsList.js
import React from 'react';
import { RAW_OPENINGS } from '../openings';

export default function OpeningsList({ onSelect }) {
    return (
        <div className="openings-list">
            <h2>Available Openings</h2>
            <ul>
                {Object.entries(RAW_OPENINGS).map(([name, moves]) => (
                    <li key={name}>
                        <button onClick={() => onSelect(name)}>
                            {name} <small>({moves.length} plies)</small>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
