const mongoose = require('mongoose');
const moment = require('moment');

const gameResultSchema = new mongoose.Schema({
    adminId:{
        type:String,
    },
    gameCategory:{
        type:String,
    },
    luckyNum:{
        type:Number,
    },
    createAt:{
        type:String,
        default: moment().format('MM DD YYYY'),
    },
    deleteAt:{
        type:Date,
    },
});

module.exports = mongoose.model('gameResults', gameResultSchema)