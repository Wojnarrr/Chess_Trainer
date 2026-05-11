import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        const res = await fetch('http://localhost:4000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        console.log('Register status:', res.status);
        const data = await res.text();           // temporarily read as text
        console.log('Register response:', data); // log raw response
        if (res.ok) nav('/profile');
        else setError((await res.json()).error);
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>Register</h2>
            {error && <div className="error">{error}</div>}
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Register</button>
        </form>
    );
}