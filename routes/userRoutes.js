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
user_route.post('/resendOtp',isLogedout,userController.resendOtp)
user_route.post('/otpenter', isLogedout, userController.verifyOtp)



user_route.get('/',Auth.checkinguseroradmin)
user_route.post('/logout',Auth.logouting)



user_route.get('/home',Auth.isLogged,userController.loadHome)
user_route.get('/index',Auth.isLogged,userController.loadindex)
user_route.get('/shop',userController.loadshop)
user_route.get('/shopdetails',Auth.isLogged,  userController.shopdetails);
user_route.get('/profile',userController.profileView)
user_route.get('/categoryselection/:categoryId',userController.categorySelection)


user_route.get('/shoppingcart',userController.shoppingpage);
user_route.post('/shoppingcart/:productId',userController.shoppingcart);
user_route.post('/cartupdation',userController.updateCart)
user_route.get('/checkout',userController.loadcheckoutpage)
user_route.post('/checkout',userController.checkout)
user_route.delete('/removeCartItem/:itemId',userController.removeCartItem)



module.exports = user_route


