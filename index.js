const dotenv  = require('dotenv')
const Notify = require('./controller/sockLogic')
const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const socket = require('socket.io')


// express App object
const app = express()

//http create server from express
const server = http.createServer(app)

// db config file
const db = require('./model/db_config')()


//apis config 
const usersapi = require('./api/userapi')
app.use('/api/users', usersapi)

// environment variables config
dotenv.config()

// io configuarations
let io  = socket(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }})

io.on('connection', socket =>{
 // instance of Notify
 const notify = new Notify(socket)

//    notify user 
//    socket.on('credit', response=>{
//        console.log(response)
//    })

    notify.credit()

    socket.on('disconnect', ()=>{
        console.log('disconnected')
    })
})


const port  =  process.env.CUSTOM_PORT ;
server.listen(port, ()=> console.log(`listening on Port ${port}`))
