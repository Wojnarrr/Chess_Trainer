// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    console.log('Incoming register:', req.body);
    const { username, password } = req.body;
    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ error: 'Username already taken' });

        const passwordHash = await User.hashPassword(password);
        const user = new User({ username, passwordHash });
        await user.save();

        // auto-login
        req.session.userId = user._id;
        res.status(201).json({ username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login existing user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await user.validatePassword(password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        req.session.userId = user._id;
        res.json({ username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Update Chess.com username
router.post('/chesscom', async (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Invalid username' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { chesscomUsername: username },
            { new: true }
        );
        res.json({ message: 'Username updated', chesscomUsername: user.chesscomUsername });
    } catch (err) {
        console.error('[user/chesscom] Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.clearCookie('connect.sid');
        res.json({});
    });
});

// Get current session
router.get('/me', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    const user = await User.findById(req.session.userId).select('username chesscomUsername');
    res.json({ username: user.username, chesscomUsername: user.chesscomUsername });});

module.exports = router;