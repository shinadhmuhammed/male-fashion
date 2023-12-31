const express = require('express')
const user_route = express.Router()
const Auth = require("../middleware/Auth")
const userController = require('../controlers/userController')
const { isLogedout, isLogged } = require('../middleware/Auth')
const wishlistController=require('../controlers/wishlistController')
const orderController=require('../controlers/orderController')
 


user_route.get('/', isLogedout, userController.loadlogin)
user_route.get('/login',userController.login)
user_route.post('/login', isLogedout, userController.userValid)
user_route.get('/register', isLogedout, userController.loadRegister)
user_route.post('/register', userController.insertUser)
user_route.get('/showOtp/:userID/:otp', isLogedout, userController.showOtp);
user_route.post('/resendOtp',isLogedout,userController.resendOtp)
user_route.post('/otpenter', isLogedout, userController.verifyOtp)
user_route.get('/forgotpassword', isLogedout, userController.loadForgotPassword);
user_route.post('/forgotpassword', isLogedout, userController.forgotPassword);
user_route.get('/resetpassword/:email', isLogedout, userController.loadResetPassword);
user_route.post('/resetpassword/:email', isLogedout, userController.resetPassword);
user_route.get('/',Auth.checkinguseroradmin)
user_route.get('/shops',userController.shops)
user_route.post('/logout',Auth.logouting)



user_route.get('/home',Auth.isLogged,userController.loadHome)
user_route.get('/index',Auth.isLogged,userController.loadindex)
user_route.get('/shop',Auth.isLogged,userController.loadshop)
user_route.get('/shopdetails',Auth.isLogged,  userController.shopdetails);
user_route.get('/shopdetailss',userController.details)
user_route.get('/contact',Auth.isLogged,userController.contact)
user_route.get('/categoryselection/:categoryName', Auth.isLogged,userController.categorySelection);
user_route.get('/sortProducts/:option',Auth.isLogged,userController.sortProducts)
user_route.get('/sortProducts', Auth.isLogged,userController.sortProducts);
user_route.get('/search',Auth.isLogged,userController.searchProducts)



user_route.get('/shoppingcart',Auth.isLogged,userController.shoppingpage);
user_route.post('/shoppingcart/:productId',Auth.isLogged,userController.shoppingcart);
user_route.post('/cartupdation',Auth.isLogged,userController.updateCart)
user_route.get('/profile',Auth.isLogged,userController.profileView)
user_route.get('/checkout',Auth.isLogged,userController.loadcheckoutpage)
user_route.post('/checkout',userController.checkout)
user_route.delete('/removeCartItem/:itemId',Auth.isLogged,userController.removeCartItem)
user_route.post('/getTotalAmount',Auth.isLogged,userController.totalAmount)
user_route.get('/pagination',userController.pagination)




user_route.post('/order',Auth.isLogged, orderController.order); 
user_route.get('/myorder',Auth.isLogged,orderController.getOrder)
user_route.post('/cancelOrder/:orderId',Auth.isLogged, orderController.cancelOrder);
user_route.get('/download-invoice/:orderId', Auth.isLogged, orderController.downloadInvoice);
user_route.get('/checkOrderStatus/:orderId', Auth.isLogged, orderController.checkOrderStatus);



user_route.post('/coupon-validate',Auth.isLogged,userController.couponValidate)
user_route.get('/edit-address/:id',Auth.isLogged, userController.editAddress);
user_route.post('/update-address/:id',Auth.isLogged,userController.updateAddress)
user_route.get('/deleteaddress',Auth.isLogged,userController.deleteAddress)
user_route.post('/razorpayorder',Auth.isLogged,userController.razorPay)
user_route.get('/changepassword',Auth.isLogged, userController.loadChangePassword);
user_route.post('/changepassword',Auth.isLogged,userController.changepassword)


user_route.get('/wishlist',Auth.isLogged, wishlistController.wishlistPage);
user_route.post('/wishlist/:productId',Auth.isLogged, wishlistController.addToWishlist);
user_route.delete('/wishlist/:itemId/remove',Auth.isLogged, wishlistController.removeFromWishlist);
user_route.post('/walletorder',Auth.isLogged,userController.walletorder)
user_route.post('/rateProduct/:orderId/:productId',Auth.isLogged,userController.rateProduct)






module.exports = user_route


