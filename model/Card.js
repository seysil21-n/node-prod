const mongoose = require('mongoose')

mongoose.model("Cards", {
    typeOfCard: String,
    cardNumber: Number,
    cvv: Number,
    expiry: String,
    customId: String,
    balance: {
        default: 300,
        type: Number
    }
},"Cards")

module.exports =  mongoose.model('Cards')