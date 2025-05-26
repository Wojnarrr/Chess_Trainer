// src/components/OpeningSelector.jsx
import React from 'react';
import { RAW_OPENINGS } from '../openings';
import './OpeningSelector.css'; // see CSS file for styling

export default function OpeningSelector({ selected, onSelect }) {
    return (
        <div className="opening-selector">
            <button className="sort-button">Sort</button>
            <ul>
                {Object.entries(RAW_OPENINGS).map(([name, moves]) => (
                    <li key={name}>
                        <button
                            className={selected === name ? 'active' : ''}
                            onClick={() => onSelect(name)}
                        >
                            <span className="opening-name">{name}</span>
                            <small className="opening-count">{moves.length} plies</small>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
