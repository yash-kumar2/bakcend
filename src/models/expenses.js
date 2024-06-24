const mongoose = require('mongoose')

const Task = mongoose.model('Expenses', {
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
    
},{ timestamps: true },)

module.exports = Expenses