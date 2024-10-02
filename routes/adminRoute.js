const express = require('express')
const admin_route = express.Router()
// const auth = require('../middlewares/adminAuth')
const adminController = require('../controllers/admin/adminController')
// const adminAuth = require('../middlewares/adminAuth')
// admin_route.get('/',adminController.adminLogin)
// admin_route.post('/',auth.isLogout,adminController.adminLogin)
// admin_route.get('/dashboard',auth.isLogin,adminController.adminHome)
// admin_route.get("/logout",auth.isLogin,adminController.adminLogout)
admin_route.get('/dashboard',adminController.loadAdminHome)
// admin_route.get('/users',adminAuth,usersController.usersMnagement)
admin_route.get('/products',adminController.loadProducts)
admin_route.get('/add_product',adminController.loadAddProduct)
admin_route.get('/categories',adminController.loadCategory)
admin_route.get('/users',adminController.loadOrders)

module.exports = admin_route