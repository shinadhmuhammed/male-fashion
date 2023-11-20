const express = require('express')
const user_route = express.Router()
const Auth = require("../middleware/Auth")
const userController = require('../controlers/userController')
const { isLogedout, isLogged } = require('../middleware/Auth')
const wishlistController=require('../controlers/wishlistController')
 

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
user_route.get('/contact',userController.contact)
user_route.get('/categoryselection/:categoryName', userController.categorySelection);
user_route.get('/sortProducts/:option',userController.sortProducts)
user_route.get('/sortProducts', userController.sortProducts);
user_route.get('/search',userController.searchProducts)



user_route.get('/shoppingcart',userController.shoppingpage);
user_route.post('/shoppingcart/:productId',userController.shoppingcart);
user_route.post('/cartupdation',userController.updateCart)
user_route.get('/profile',userController.profileView)
user_route.get('/checkout',userController.loadcheckoutpage)
user_route.post('/checkout',userController.checkout)
user_route.delete('/removeCartItem/:itemId',userController.removeCartItem)
user_route.post('/getTotalAmount',userController.totalAmount)




user_route.post('/order', userController.order); 
user_route.get('/edit-address/:id', userController.editAddress);
user_route.post('/update-address/:id',userController.updateAddress)
user_route.get('/deleteaddress',userController.deleteAddress)
user_route.post('/razorpayorder',userController.razorPay)
user_route.get('/changepassword', userController.loadChangePassword);
user_route.post('/changepassword',userController.changepassword)
user_route.get('/myorder',userController.getOrder)
user_route.post('/cancelOrder/:orderId', userController.cancelOrder);

user_route.post('/coupon-validate',userController.couponValidate)


user_route.get('/wishlist', wishlistController.wishlistPage);
user_route.post('/wishlist/:productId', wishlistController.addToWishlist);
user_route.delete('/wishlist/:itemId/remove', wishlistController.removeFromWishlist);







module.exports = user_route


