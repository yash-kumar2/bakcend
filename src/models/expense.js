const mongoose = require('mongoose');

const Expense = mongoose.model('Expense', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    type:{
        type:String,
        default:"Expense",

    },
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
        default: null,
        ref: 'Groups'
    },
    amount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = Expense;
