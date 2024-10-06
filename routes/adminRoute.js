const express = require('express')
const admin_route = express.Router()
const multer = require('multer')
const path = require('path')
const upload = require('../config/multer')

// const auth = require('../middlewares/adminAuth')
const usersContorller = require('../controllers/admin/usersController')
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryController')
const productController = require('../controllers/admin/productController')
const brandController = require('../controllers/admin/brandController')

// const adminAuth = require('../middlewares/adminAuth')
admin_route.get('/',adminController.loadAdminLogin)

admin_route.post('/',adminController.adminLogin)
admin_route.get('/dashboard',adminController.adminHome)
admin_route.get("/logout",adminController.adminLogout)

// admin_route.get('/users',adminAuth,usersController.usersMnagement)


//Users Mangagement
admin_route.get('/users',usersContorller.loadUsers)
admin_route.get('/blockUser/:id',usersContorller.blockUser)
admin_route.get('/unblockUser/:id',usersContorller.unblockUser)
//Category Management
admin_route.get('/categories',categoryController.loadCategory)
admin_route.post('/edit-category/:id',categoryController.editCategory)
admin_route.post('/add-category',categoryController.addCategory)
admin_route.post('/delete-category',categoryController.deleteCategory)

// Product Management 
// admin_route.get('/brands',brandController.loadBrands)
// Product Mangement
admin_route.get('/products',productController.loadProducts)
admin_route.get('/add_product',productController.loadAddProduct)
admin_route.post('/add_product',upload.any(),productController.addProduct)

module.exports = admin_route