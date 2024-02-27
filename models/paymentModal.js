const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    status: {
        type: String,
        required: [true, "Status not found"]

    },
    userId: {
        type: String,
        required: [true, "user id not found"]
    },
    amount: Number,
    fluctuation:String,

    transductionId:String,
    transductionDetails:String,
    
    createAt: {
        type: Date,
        default: Date.now,
    },
    deleteAt: {
        type: Date,
    },
});


module.exports = mongoose.model('payments', paymentSchema)