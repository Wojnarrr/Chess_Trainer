const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: String },
    date: { type: Date },
    moveNumber: Number,
    ply: Number,
    fenBefore: String,
    actualSan: String,
    bestSan: String,
    evalBefore: Number,
    evalAfter: Number,
    evalDrop: Number,
    pgn: String,
});

module.exports = mongoose.model('PuzzleCandidate', puzzleSchema);