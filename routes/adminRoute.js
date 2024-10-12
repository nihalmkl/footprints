const express = require('express')
const admin_route = express.Router()
const upload = require('../config/multer')
const adminAuth = require('../middlewares/adminAuth')


//Admin controllers
const usersContorller = require('../controllers/admin/usersController')
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryController')
const productController = require('../controllers/admin/productController')
const brandController = require('../controllers/admin/brandController')
const orderController = require('../controllers/admin/orderController')

//Login Admin
admin_route.get('/',adminController.loadAdminLogin)
admin_route.post('/adm-login',adminController.adminLogin)
admin_route.get('/dashboard',adminAuth.isLogged,adminController.adminHome)
admin_route.post("/adminLogout", adminController.adminLogout);


//Users Mangagement
admin_route.get('/users',usersContorller.loadUsers)
admin_route.get('/blockUser/:id',usersContorller.blockUser)
admin_route.get('/unblockUser/:id',usersContorller.unblockUser)


//Category Management
admin_route.get('/categories',categoryController.loadCategory)
admin_route.post('/edit-category/:id',categoryController.editCategory)
admin_route.post('/add-category',categoryController.addCategory)
admin_route.post('/delete-category',categoryController.deleteCategory)

// Brand Management
admin_route.get('/brands',brandController.loadBrand)
admin_route.post('/edit-brand/:id',brandController.editBrand)
admin_route.post('/add-brand',brandController.addBrand)
admin_route.post('/delete-brand',brandController.deleteBrand)

// Product Mangement
admin_route.get('/products',productController.loadProducts)
admin_route.get('/add_product',productController.loadAddProduct)
admin_route.post('/add-product',upload.any(),productController.addProduct)
admin_route.get('/edit_product/:id',productController.editProductPage)
admin_route.post('/edit-product/:id', upload.array('productImages[]', 4),productController.editProduct);
admin_route.post('/delete_product/:id',productController.deleteProduct)
admin_route.post('/delete-image',productController.deleteImage)

//order Management

admin_route.get('/orders',orderController.loadOrderPage)
module.exports = admin_route