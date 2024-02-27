const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
    gameCategory: {
        type: String,
        required: [true, "Please select game"]

    },
    userId: {
        type: String,
        required: [true, "user id not found"]
    },
    betNo: String,
    betPrice: String,
    game: String,

    
    createAt: {
        type: Date,
        default: Date.now,
    },
    deleteAt: {
        type: Date,
    },
});

module.exports = mongoose.model('gameHistory', gameHistorySchema)