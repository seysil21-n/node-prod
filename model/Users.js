const mongoose = require('mongoose')

mongoose.model('Users', {
    email: String,
    phone: Number || String,
    password: String,
    selectedCard: {type: String, default:''},
    selectedCardNumber: {type: String, default:''},
    selectedCardBalance: {type: String, default:''},
    name:String
})

module.exports = mongoose.model('Users')