// src/components/SideSelector.js
import React from 'react';

export default function SideSelector({ side, onChange }) {
    return (
        <label>
            Side:
            <select
                value={side}
                onChange={e => onChange(e.target.value)}
                style={{ marginLeft: '0.5rem' }}
            >
                <option value="White">White</option>
                <option value="Black">Black</option>
            </select>
        </label>
    );
}
