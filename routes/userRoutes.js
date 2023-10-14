const express = require('express')
const user_route = express.Router()
const Auth = require("../middleware/Auth")
const userController = require('../controlers/userController')
const { isLogedout, isLogged } = require('../middleware/Auth')
 

user_route.get('/login', isLogedout, userController.loadlogin)
user_route.post('/login', isLogedout, userController.userValid)


user_route.get('/register', isLogedout, userController.loadRegister)
user_route.post('/register', userController.insertUser)



user_route.get('/showOtp/:userID/:otp', isLogedout, userController.showOtp);
// user_route.get('/resendOtp',isLogedout,userController.resendOtp)
user_route.post('/otpenter', isLogedout, userController.verifyOtp)



user_route.get('/',Auth.checkinguseroradmin)
user_route.post('/logout',Auth.logouting)



user_route.get('/home',Auth.isLogged,userController.loadHome)
user_route.get('/index',Auth.isLogged,userController.loadindex)
user_route.get('/shop',Auth.isLogged,userController.loadshop)
user_route.get('/zoom',Auth.isLogged,userController.zoom)



module.exports = user_route


