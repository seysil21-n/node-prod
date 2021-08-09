const express = require('express')
const Vonage = require('@vonage/server-sdk')
const mongoose = require('mongoose')
const router = express.Router()
const authMeths  = require("../auth/auth")
const session = require('express-session')
const bcrypt = require('bcrypt')
const cors  = require('cors')
const jwt = require('jsonwebtoken')
const { response } = require('express')


//vonage config
const vonage = new Vonage({
    apiKey: "16153087",
    apiSecret: "ZUPjW6M0zdpElh8q"
  }) 

// //cors middleware
router.use(cors())

// users model
require('../model/Users')
let Users = mongoose.model('Users')

//cards model 
require('../model/Card')
let Card = mongoose.model('Cards')

// json parser middleware
router.use(express.json())
router.use(express.urlencoded({extended: true}))

// session middleware
// router.use(session({
//     resave: true,
//     saveUninitialized: true,
//     secret: process.env.SECRET,
//     cookie: {
//         httpOnly: true, secure: false, sameSite: true,path: '/'
//     }
    
// }))

router.get('/login', (req,res,next)=>{
  
  console.log('login get')

})

// login api
router.post('/login', (req,res, next)=>{

    // calling the auth middleware
    authMeths.authenticate(req,res,next,Users)
    
    console.log('login post')


})


// register api @public
router.get('/register', (req,res, next)=>{
    console.log(re.body)
})


router.post('/register', (req,res, next)=>{
    let {fullName,email,password,phone} = req.body

    console.log(req.body)

    // check to see if user already exists
    Users.findOne({email: email})
    .then(response=> {
        if(response)
            res.send({error: 'Email has been taken'})
        else{

            // hash password
            bcrypt.hash(password,10)
            .then(function(hash){
            
            // save user to db  
              new Users({name: fullName,email,password: hash,phone})
                .save()
                .then(response=> {
                    res.send({success: 'New User added'})
                })
                .catch(err=> {
                    if(err) throw err
                })
            })
        }
    })
    .catch(err=> {
        if(err) throw err
    })



    // bcrypt.hash(user.password, 10).then(function(hash) {


    //     new Users({email: user.email, phone: user.phone, password: hash})
    //     .save()
    //     .then(response=>{
    //         jwt.sign({id: response.id}, process.env.JWT_SECRET, (err,token)=>{
    //             if(err) throw err

    //             res.send({token,user: response})
    //         })
            
    //     })
    // });

   
})

// dashboard api
router.get('/dashboard', authMeths.isAuthenticated,(req,res,next)=>{
    // res.send(req.user)

    Users.findById(req.user.id)
    .select('-password')
    .then(user=>{
        res.send(user)
    })
})


//cards api

// fetching auth user cards
// Private

router.get('/cards', authMeths.isAuthenticated, (req,res)=>{
    Card.find({customId: req.user.id})
    .then(response => res.status(200).send(response))
    .catch(err=> err && console.error(err))
})



// adding a card Private
//adding a card
router.post('/cards/add', authMeths.isAuthenticated, (req,res,next)=>{
    let {cvv,number,exp} = req.body;

    // validation
    

    if(!cvv || !number || !exp){
        return res.json({error: 'Please fill all fields'})
    }

    if(number.trim().length > 16 || number.trim().length < 16) return res.json({error: 'Card not valid'})

    if(cvv.length > 3 || cvv.length < 3) return res.json({error: 'Enter a valid cvv'})


    new Card({typeOfCard: 'visa',cardNumber:number, cvv, expiry:exp, customId: req.user.id})
    .save()
    .then(response=> {
        // console.log('s',response)

        //run query to check if theres only one card
        Card.find({customId: response.customId}).then(allcards => {
            console.log(allcards)
            if(allcards.length < 2){

            // find user that just added a card and update the selected card field of that user
            Users.updateOne({_id: response.customId}, {
                selectedCard: response._id,
                selectedCardNumber: response.cardNumber,
                selectedCardBalance: response.balance})

            .then(updated=> {
                console.log(updated)
            })
                console.log(true)
            }
        
        })

        res.status(200).send(response)
    })
    

    console.log(req.body,req.user)
})

// selected card : Private works when the user has only 1 card
router.get('/cards/selectedCard', authMeths.isAuthenticated, (req,res,next)=>{
    console.log(req.user.id)
    Users.findById(req.user.id)
    .select("-password")
    .then(response => {
        // console.log(response)
        res.send(response)
    })
})

// @private
router.post('/cards/switch', authMeths.isAuthenticated, (req,res,next)=>{
    // console.log(req.body,req.user.id)
    const {updatedCard,updatedCardNumber,updatedCardBalance} = req.body
    console.log(req.body)
    // find user and update cardSelected

    Users.updateOne({_id: req.user.id}, {
        selectedCard: req.body.updatedCard, 
        selectedCardNumber: updatedCardNumber,
        selectedCardBalance: updatedCardBalance
        })
    .then(response=> {
        console.log(response)

        Users.findById(req.user.id)
        .select('-password')
        .then(response => {
            console.log(response)
            res.status(200).send(response)
        })
    })

})

// transfer money api 

router.post('/confirmDestination', authMeths.isAuthenticated, (req,res,next)=>{
    let {receipientInfo,amount,network} = req.body

    if(network === 'direct'){
        Users.findOne({email: receipientInfo})
        .select('-password')
        .then(user => {
            console.log(user)

            if(!user) {
                res.send({error: 'User not found'})
            } 

            if(user)  res.status(200).send(user)
        })
    }

    
})

router.post('/transferMoney', authMeths.isAuthenticated, (req,res,next)=>{


    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if(responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })
})


router.post('/creditAccount', (req,res)=>{
    console.log(req.body)
    Users.findOne({email:req.body.destinationEmail})
    .then(response=>{

        Users.updateOne({email: req.body.destinationEmail}, {selectedCardBalance: parseInt(response.selectedCardBalance)  + parseInt(req.body.amount) })
        .then(upres=>{
            console.log(upres)
        })

        

    })
    .catch(err=> {
        if(err) throw err
    })

    // debit
    Users.findOne({email:req.body.sender})
    .then(response=>{

        Users.updateOne({email: req.body.sender}, {selectedCardBalance: parseInt(response.selectedCardBalance)  - parseInt(req.body.amount) })
        .then(upres=>{
            console.log(upres)
            res.send({success: 'Successfully sent'})
        })

        

    })
    .catch(err=> {
        if(err) throw err
    })
    
})



// momo network providers api

router.get('/mobilemoney', (req,res)=>{

})



// logout api
router.delete('/logout', (req,res,next)=>{
    delete req.session.user 
    res.redirect('/login')
})



module.exports = router