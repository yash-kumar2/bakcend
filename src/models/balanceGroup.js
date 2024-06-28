const mongoose = require('mongoose');

const BalanceGroup = mongoose.model('BalanceGroup', {
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    for: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Groups'
    },
    amount: {
        type: Number,
        default: 0
    }
});

module.exports = BalanceGroup;
