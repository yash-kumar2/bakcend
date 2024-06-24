const mongoose = require('mongoose')

const Groups = mongoose.model('Groups', {
    name: {
        type: String,
        required: true,
        trim: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            
            default: [],
        },
    
    
    ]
})

module.exports = Groups