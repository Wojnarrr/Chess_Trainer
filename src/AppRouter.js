import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OpeningsPage from './pages/OpeningsPage';
import BotGame from './pages/BotGame';

export default function AppRouter() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch('http://localhost:4000/api/auth/me', {
            credentials: 'include'
        })
            .then(res => setIsLoggedIn(res.ok))
            .catch(() => setIsLoggedIn(false));
    }, []);

    return (
        <BrowserRouter>
            <Header isLoggedIn={isLoggedIn} />
            <div className="page-content" style={{ padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/openings" element={<OpeningsPage />} />
                    <Route path="/bot" element={<BotGame />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
