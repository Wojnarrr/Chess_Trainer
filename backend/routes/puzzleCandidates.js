// backend/routes/puzzleCandidates.js
const express = require('express');
const router = express.Router();
const PuzzleCandidate = require('../models/PuzzleCandidate');
const User = require('../models/User');
const { analyzePosition } = require('../engine/engine');
const { Chess } = require('chess.js');

// helper to fetch archives
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Fetch last mistakes from recent Chess.com archives
async function fetchRecentMistakesForUser(user, maxMistakes = 50) {
    const allMistakes = [];
    const username = user.chesscomUsername.toLowerCase();

    const archivesRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
    const archivesData = await archivesRes.json();
    const archiveUrls = archivesData.archives.reverse(); // most recent first


    for (const archiveUrl of archiveUrls) {
        const res = await fetch(archiveUrl);
        const archive = await res.json();

        for (const g of archive.games) {
            if (!g.pgn) continue;
            const isWhite = g.white.username.toLowerCase() === username;
            const chess = new Chess();
            chess.loadPgn(g.pgn);
            const moves = chess.history({ verbose: true });
            chess.reset();

            for (let ply = 0; ply < moves.length; ply++) {
                const move = moves[ply];

                const isUsersMove = (isWhite && ply % 2 === 0) || (!isWhite && ply % 2 === 1);
                if (!isUsersMove) {
                    chess.move(move);
                    continue;
                }

                // Skip very early game (opening phase)
                if (ply < 10) {
                    chess.move(move);
                    continue;
                }

                const fenBefore = chess.fen();
                const actualSan = move.san;

                const analysis = await analyzePosition(fenBefore, actualSan);

                const normalize = (rawEval) => isWhite ? rawEval : -rawEval;
                const drop = normalize(analysis.evalBefore) - normalize(analysis.evalAfter);

                //  Skip if eval is already hopeless
                const evalBeforeNorm = normalize(analysis.evalBefore);
                if (Math.abs(evalBeforeNorm) > 800) {
                    chess.move(move);
                    continue;
                }

                //  Skip if best move is equal to actual move
                if (actualSan === analysis.bestSan) {
                    chess.move(move);
                    continue;
                }

                //  Store if it's a real mistake
                if (drop >= 150) {
                    allMistakes.push({
                        userId: user._id,
                        gameId: g.url,
                        date: new Date(g.end_time * 1000),
                        moveNumber: Math.floor(ply / 2) + 1,
                        ply: ply + 1,
                        fenBefore,
                        actualSan,
                        bestSan: analysis.bestSan,
                        evalBefore: analysis.evalBefore,
                        evalAfter: analysis.evalAfter,
                        evalDrop: drop,
                        pgn: g.pgn,
                    });
                }

                chess.move(move);

                if (allMistakes.length >= maxMistakes) return allMistakes;
            }


            if (allMistakes.length >= maxMistakes) return allMistakes;
        }
    }

    return allMistakes;
}

// POST /api/puzzles/refresh — manual refresh
router.post('/refresh', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user || !user.chesscomUsername) {
            return res.status(400).json({ error: 'Chess.com username not set' });
        }

        await PuzzleCandidate.deleteMany({ userId: user._id });
        const mistakes = await fetchRecentMistakesForUser(user);
        await PuzzleCandidate.insertMany(mistakes);

        res.json({ message: `Refreshed ${mistakes.length} puzzle candidates.` });
    } catch (err) {
        console.error('[puzzles/refresh] Error:', err);
        res.status(500).json({ error: 'Failed to refresh puzzles' });
    }
});

// GET /api/puzzles/init — only if no puzzles exist for user
router.get('/init', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user || !user.chesscomUsername) {
            return res.status(400).json({ error: 'Chess.com username not set' });
        }

        const existing = await PuzzleCandidate.find({ userId: user._id });
        if (existing.length > 0) return res.json({ message: 'Puzzles already exist', count: existing.length });

        const mistakes = await fetchRecentMistakesForUser(user);
        await PuzzleCandidate.insertMany(mistakes);

        res.json({ message: `Initialized with ${mistakes.length} puzzle candidates.` });
    } catch (err) {
        console.error('[puzzles/init] Error:', err);
        res.status(500).json({ error: 'Failed to initialize puzzles' });
    }
});

//  ensure the user is logged in
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}
// GET /api/puzzles/random → Get one random puzzle for the current user
router.get('/random', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const count = await PuzzleCandidate.countDocuments({ userId });

        if (count === 0) {
            return res.status(404).json({ error: 'No puzzle candidates found' });
        }

        const randomIndex = Math.floor(Math.random() * count);
        const [puzzle] = await PuzzleCandidate.find({ userId }).skip(randomIndex).limit(1);

        res.json(puzzle);
    } catch (err) {
        console.error('[PUZZLE /random] Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
