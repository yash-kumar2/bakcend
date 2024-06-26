const mongoose = require('mongoose')

const Expense = mongoose.model('Expense', {
    description: {
        type: String,
        required: true,
        trim: true
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
        defualt:null,
        ref: 'Groups'
    },
    amount:{
        type:Number,

    },
    
})

module.exports = Expense