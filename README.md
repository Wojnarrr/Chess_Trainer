# Chess Trainer

## Overview

Chess Trainer is a full-stack chess learning platform that combines opening training, game analysis, and personalized puzzle generation using the Stockfish chess engine.

The application allows users to analyze games, detect mistakes through engine evaluation, and train using puzzles generated from real gameplay positions. The system was designed to bridge the gap between playing games and structured improvement by transforming player mistakes into interactive training opportunities.

The project integrates opening study, tactical training, automated analysis, and game exploration into a single application focused on practical chess improvement.

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
- react-chessboard
- Component-based UI architecture

### Backend
- Node.js
- Express.js REST API
- MongoDB integration
- Chess.com archive processing

### Chess Engine
- Stockfish integration via child process communication
- Automated position analysis
- Move evaluation and best move generation

### Database
- MongoDB
- Mongoose models
- Puzzle candidate storage
- User profile management

---
# Project Structure

```text
Chess_Trainer/
│
├── backend/
│   ├── engine/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│
├── README.md
└── .gitignore
```


# How It Works

1. A user imports a Chess.com game or loads a public archive
2. The backend parses the PGN and sends positions to Stockfish
3. Stockfish evaluates each move and position
4. Significant evaluation drops are detected as mistakes
5. Important positions are stored as puzzle candidates
6. Users can later solve generated puzzles based on their own games

The puzzle system focuses on meaningful mistakes rather than generic engine-perfect play, creating a more personalized training experience.

---

# API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/analyze | Analyze a chess position using Stockfish |
| GET | /api/archives/:username | Fetch Chess.com archives |
| POST | /api/puzzles | Store generated puzzle candidates |

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

---

## Run Frontend

```bash
cd client
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

## Run Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on:

```text
http://localhost:4000
```

---
# Stockfish Setup

Ensure Stockfish is installed and correctly configured within the backend engine integration.

The application communicates with the Stockfish engine through Node.js child process integration for move evaluation and analysis.

---
# Technical Highlights

- Full-stack React and Node.js architecture
- Stockfish chess engine integration
- Automated mistake detection based on evaluation drops
- MongoDB database integration
- REST API development
- Interactive chessboard system
- Dynamic puzzle generation pipeline
- Chess.com archive integration
- PGN parsing and analysis

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
- Expanded authentication system
- Engine evaluation graphs
- Endgame tablebase integration

---

# Project Highlights

This project demonstrates:
- Full-stack web development
- REST API development
- Chess engine communication
- Real-world game data analysis
- Interactive UI design
- Database-driven puzzle generation
- Algorithmic mistake detection
- External API integration

---

# Author

Kacper

GitHub: https://github.com/Wojnarrr
