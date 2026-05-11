// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 1000 } // 1 day
}));

// Health check
app.get('/', (req, res) => {
    res.send('Chess Trainer API is running');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const analysisRoutes = require('./routes/analysis');
app.use('/api/analyze', analysisRoutes);

const puzzlesRoutes = require('./routes/puzzleCandidates');
app.use('/api/puzzles', puzzlesRoutes);


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});