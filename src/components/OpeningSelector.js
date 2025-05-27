// src/components/OpeningSelector.jsx
import React from 'react';
import { OPENING_CATEGORIES } from '../openings';
import './OpeningSelector.css';

export default function OpeningSelector({ selected, onSelect }) {
    return (
        <div className="opening-selector">
            <button className="sort-button">Sort</button>
            {Object.entries(OPENING_CATEGORIES).map(([categoryName, openers]) => (
                <div key={categoryName} className="category-section">
                    <h3 className="category-title">{categoryName}</h3>
                    <ul>
                        {Object.entries(openers).flatMap(([openingName, data]) => {
                            if (Array.isArray(data)) {
                                return (
                                    <li key={openingName}>
                                        <button
                                            className={selected === openingName ? 'active' : ''}
                                            onClick={() => onSelect(openingName)}
                                        >
                                            <span className="opening-name">{openingName}</span>
                                            <small className="opening-count">{data.length} plies</small>
                                        </button>
                                    </li>
                                );
                            } else {
                                return Object.entries(data).map(([variationName, moves]) => {
                                    const fullName = `${openingName} - ${variationName}`;
                                    return (
                                        <li key={fullName}>
                                            <button
                                                className={selected === fullName ? 'active' : ''}
                                                onClick={() => onSelect(fullName)}
                                            >
                                                <span className="opening-name">{openingName}</span>
                                                <small className="opening-count">{variationName}</small>
                                            </button>
                                        </li>
                                    );
                                });
                            }
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}
