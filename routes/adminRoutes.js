const express = require('express')
const admin_route = express.Router()
const adminController = require('../controlers/adminController')
const Auth = require("../middleware/Auth")
const uploadMulter=require('../middleware/multer')






admin_route.get('/login', Auth.logoutAdmin, adminController.loadAdmin)
admin_route.post('/login', Auth.logoutAdmin,  adminController.adminValid)
admin_route.get('/dashboard', Auth.loggedadmin, adminController.userDashboard)



admin_route.get('/products',Auth.loggedadmin,adminController.products)
// admin_route.get('/form',Auth.loggedadmin,adminController.form)
admin_route.get('/addproduct',Auth.loggedadmin,adminController.addProducts)
admin_route.post('/addproduct',Auth.loggedadmin,uploadMulter.array('productImage',5),adminController.addProduct);
admin_route.delete('/deleteproduct/:productId',adminController.deleteProduct)
admin_route.get('/editproduct/:productId',Auth.loggedadmin,adminController.editProductForm)
admin_route.post('/editproduct/:productId', Auth.loggedadmin, uploadMulter.array('productImage', 5), adminController.editProduct);



admin_route.get('/users',Auth.loggedadmin,adminController.user)
admin_route.get('/blockuser/:userId', Auth.loggedadmin, adminController.blockUser);
admin_route.get('/unblockuser/:userId',Auth.loggedadmin,adminController.unblockUser)



admin_route.get('/category',Auth.loggedadmin,adminController.categories)
admin_route.get('/categories',Auth.loggedadmin,adminController.categori)
admin_route.get('/addcategories',Auth.loggedadmin,adminController.addcategories)
admin_route.post('/addcategory',Auth.loggedadmin,adminController.addcategory)
admin_route.delete('/deletecategory/:categoryId', Auth.loggedadmin, adminController.deleteCategory);
admin_route.get('/editcategory/:categoryId', Auth.loggedadmin, adminController.editcategoryform);
admin_route.post('/editcategory/:categoryId', Auth.loggedadmin, adminController.editcategory);





admin_route.post('/logout', Auth.loggedadmin, adminController.logout)














// admin_route.post('/createUser', Auth.loggedadmin, adminController.createUser)

// admin_route.get('/dashboard/createUser', Auth.loggedadmin, adminController.loadCreateUser)

// admin_route.get('/logoutAdmin',Auth.logouting)






module.exports = admin_route;
