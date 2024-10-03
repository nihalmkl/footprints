const express = require('express')
const admin_route = express.Router()

// const auth = require('../middlewares/adminAuth')
const usersContorller = require('../controllers/admin/usersController')
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryController')
// const adminAuth = require('../middlewares/adminAuth')
// admin_route.get('/',adminController.adminLogin)
// admin_route.post('/',auth.isLogout,adminController.adminLogin)
// admin_route.get('/dashboard',auth.isLogin,adminController.adminHome)
// admin_route.get("/logout",auth.isLogin,adminController.adminLogout)
admin_route.get('/dashboard',adminController.loadAdminHome)
// admin_route.get('/users',adminAuth,usersController.usersMnagement)
admin_route.get('/products',adminController.loadProducts)
admin_route.get('/add_product',adminController.loadAddProduct)

//Users Mangagement
admin_route.get('/users',usersContorller.loadUsers)
admin_route.get('/blockUser',usersContorller.blockUser)
admin_route.get('/blockUser',usersContorller.unblockUser)
//Category Management
admin_route.get('/categories',categoryController.loadCategory)
admin_route.post('/add-category',categoryController.addCategory)
// admin_route.patch('')

module.exports = admin_route