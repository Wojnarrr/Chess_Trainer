# Chess Trainer

## Overview

Chess Trainer is a full-stack chess learning platform designed to help players improve through interactive training, automated game analysis, and personalized puzzle generation.

The application combines opening training, game exploration, AI-assisted analysis, and mistake-based puzzle solving into a single platform. Using the Stockfish chess engine, the system evaluates games, identifies critical mistakes, and converts them into training opportunities tailored to the player.

The project was developed to bridge the gap between playing games and structured improvement by allowing users to train directly from their own mistakes and game history.

---

# Features

## Opening Trainer
- Practice opening repertoires interactively
- Reinforce move sequences through repetition
- Improve opening memorization and pattern recognition

## Opening Explorer
- Explore opening variations and continuations
- Navigate through move trees on an interactive chessboard
- Study different opening lines and positions

## Puzzle Mode
- Solve puzzles generated from real player mistakes
- Train using positions extracted from analyzed games
- Improve tactical awareness and decision making

## Bot Game Mode
- Play against AI-controlled opponents
- Interactive move navigation and move history tracking
- Configurable difficulty system planned for future expansion

## Game Analysis
- Import and analyze Chess.com games
- Move-by-move evaluation using Stockfish
- Position evaluation using centipawn analysis

## Automated Mistake Detection
- Detect inaccuracies, mistakes, and blunders automatically
- Identify critical evaluation drops during games
- Store important training positions for puzzle generation

## Player Lookup
- Search public Chess.com usernames
- Load and review player game archives
- Analyze games directly within the application

## Interactive Chessboard System
- Move highlighting
- Board navigation controls
- Position replay functionality
- Interactive move history display

## User Profiles
- Save player information
- Store generated puzzle candidates
- Maintain personalized training data

---

# Game Modes

| Mode | Description |
|------|-------------|
| Trainer | Practice chess openings interactively |
| Explorer | Explore opening variations and move trees |
| Puzzle | Solve mistake-based training puzzles |
| Bot Game | Play against AI opponents |
| Analysis | Analyze games using Stockfish |
| Player Lookup | Search and analyze Chess.com users |

---

# System Architecture

```text
Frontend (React)
    ↓
Backend (Node.js + Express)
    ↓
Stockfish Engine (Child Process)
    ↓
MongoDB Database
```

## Architecture Components

### Frontend
- React
- React Router
- Chessboard UI integration

### Backend
- Node.js
- Express.js REST API

### Chess Engine
- Stockfish integration via child process communication

### Database
- MongoDB with Mongoose models

---

# How It Works

1. A user imports a Chess.com game or loads a public archive
2. The backend parses the PGN and sends positions to Stockfish
3. Stockfish evaluates each move and position
4. Significant evaluation drops are detected as mistakes
5. Important positions are stored as puzzle candidates
6. Users can later solve generated puzzles based on their own games

The puzzle system focuses on meaningful mistakes rather than generic engine-perfect play, creating a more personalized training experience.

---

# Tech Stack

## Frontend
- React
- JavaScript
- React Router

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Chess Libraries & Engine
- Stockfish
- chess.js
- react-chessboard

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Wojnarrr/Chess_Trainer.git
cd Chess_Trainer
```

## Install Frontend Dependencies

```bash
cd client
npm install
npm start
```

## Install Backend Dependencies

```bash
cd server
npm install
npm run dev
```

## Stockfish Setup

Ensure Stockfish is installed and correctly configured within the backend engine integration.

---

# Project Goals

The project was designed to:
- Improve chess learning through personalized training
- Automate game analysis and mistake detection
- Create reusable puzzles from real gameplay
- Provide an integrated platform for opening study and tactical improvement

---

# Future Improvements

- Opening classification system
- Puzzle difficulty rating
- Advanced statistics dashboard
- Multiplayer functionality
- Cloud deployment
- User authentication expansion
- Engine evaluation graphs
- Endgame tablebase integration

---

# Screenshots

Add application screenshots here:
- Opening Trainer
- Puzzle Mode
- Game Analysis
- Bot Game
- Player Lookup
- Profile Dashboard

---

# Project Highlights

This project demonstrates:
- Full-stack web development
- AI engine integration
- REST API development
- Chess engine communication
- Real-world game data analysis
- Interactive UI design
- Database-driven puzzle generation

---

# Author

Kacper

GitHub: https://github.com/Wojnarrr
