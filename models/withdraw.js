const mongoose = require('mongoose');

const withdrawPaymentSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'pending',
    },
    userId: {
        type: String,
        required: [true, "user id not found"]
    },
    
    amount: Number,
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


module.exports = mongoose.model('withdraw-payments', withdrawPaymentSchema)