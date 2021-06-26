const mongoose = require("mongoose");

// bringing in the user model
require("../model/Users")
let Users = mongoose.model('Users')

class Notify{

    constructor(socket){
        // for external use only
        this.socket = socket

    }

    credit = () => {
        this.socket.on('credit', response =>{
            Users.findOne({email: response.destinationEmail})
            .then(response =>{
                this.socket.broadcast.emit('notify', response)
                console.log('Done')
            })

            .catch(err=>{
                console.log(err)
            })
        })
    }


}

module.exports = Notify