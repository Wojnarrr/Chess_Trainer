const express = require('express');
const router = express.Router();
const { analyzePosition, getBotMove  } = require('../engine/engine');

// Analyze a position using Stockfish engine
router.post('/', async (req, res) => {
    try {
        const { fen, actualSan } = req.body;

        console.log('[ANALYZE API] FEN:', fen);

        if (!fen) {
            return res.status(400).json({ error: 'FEN string required' });
        }
        const result = await analyzePosition(fen, actualSan); //include actual move for comparison
        console.log('[ANALYZE API] Result:', result);
        res.json(result);
    } catch (error) {
        console.error('[ANALYZE ERROR]', error);
        res.status(500).json({ error: 'Engine analysis failed', details: error.message });
    }
});

// Get the best move for a bot using Stockfish engine
router.post('/botmove', async (req, res) => {
    try {
        const { fen, level } = req.body;
        console.log('[BOTMOVE API] FEN:', fen, 'Level:', level);
        if (!fen || !level) {
            return res.status(400).json({ error: 'FEN and level required' });
        }

        const elo = 200 + (level - 1) * 100;
        const depth = 6;

        const result = await getBotMove(fen, elo, depth);
        console.log('[BOTMOVE API] Result:', result);
        res.json(result);
    } catch (error) {
        console.error('[BOTMOVE ERROR]', error);
        res.status(500).json({ error: 'Bot move failed', details: error.message });
    }
});
module.exports = router;
