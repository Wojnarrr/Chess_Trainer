# Chess Trainer and Puzzle Web Application

BSc (Hons) Computing Science – Final Year Dissertation
##Abstract
This repository contains the implementation of a web-based chess training platform developed as part of a Final Year Dissertation for the BSc (Hons) in Computing Science. The project focuses on the creation of a personalised chess training system that generates interactive puzzles derived from real player mistakes, identified through chess engine analysis of archived games

## Features

- **Mistake-Based Puzzle Generation**
  - Analyses real chess games using the Stockfish engine
  - Detects mistakes based on significant evaluation drops
  - Converts detected mistakes into interactive training puzzles

- **Puzzle Mode**
  - Presents positions occurring before a recorded mistake
  - Users attempt to find a stronger alternative move
  - Answers are scored based on evaluation improvement rather than exact move matching

- **Openings Trainer**
  - Interactive opening practice and exploration
  - Guided move progression with validation

- **Chess.com Integration**
  - Imports player game archives
  - Analyses games and extracts training data automatically

- **User Accounts**
  - Authentication and profile management
  - Persistent storage of generated puzzles (extensible)

---

## Technical Highlights

- Chess engine integration using Stockfish via Node.js child processes
- Custom mistake detection logic based on evaluation thresholds
- RESTful API design
- Modular React frontend architecture
- MongoDB data modelling for training content

---
## Tech Stack

**Frontend**
- React
- JavaScript
- React Router
- Chessboard UI components

**Backend**
- Node.js
- Express.js
- Stockfish (engine analysis)

**Database**
- MongoDB

---
## Setup

### Prerequisites
- Node.js
- MongoDB
- Stockfish chess engine

### Installation

```bash
git clone https://github.com/Wojnarrr/Chess_Trainer
cd chess-trainer
cd client
npm install
npm start
cd server
npm install
npm run dev
