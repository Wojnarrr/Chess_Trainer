import React from "react";
import { Link } from "react-router-dom";
import '../styles/Header.css';

const Header = ({ isLoggedIn }) => {
    return (
        <header className="main-header">
            <div className="nav-left">
                <Link to="/" className="logo">♔ ChessTrainer</Link>
                <Link to="/openings">Openings</Link>
                <Link to="/bot">Bot</Link>
                <Link to="/puzzle-mode">Mistake Puzzle</Link>
                <Link to="/lookup">Player Game Lookup</Link>
            </div>
            <div className="nav-right">
                {isLoggedIn ? (
                    <Link to="/profile">Profile</Link>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
