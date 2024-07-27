const mongoose = require('mongoose');

const BalanceGroupFriends = mongoose.model('BalanceGroupFriends', {
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
    group: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Groups'
    },
    amount: {
        type: Number,
        default: 0
    }
});

module.exports = BalanceGroupFriends;
