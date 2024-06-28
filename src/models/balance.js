const mongoose = require('mongoose');

const Balance = mongoose.model('Balance', {
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    for: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    amount: {
        type: Number,
        default: 0
    }
});

module.exports = Balance;
