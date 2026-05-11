// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    chesscomUsername: { type: String, default: '' }
});

// instance method to validate password
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.passwordHash);
};

// static method to hash password
userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);