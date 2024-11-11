const express = require('express')
const admin_route = express.Router()
const upload = require('../config/multer')
const adminAuth = require('../middlewares/adminAuth')


const Orders = require('../models/orderSchema')
//Admin controllers
const usersContorller = require('../controllers/admin/usersController')
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryController')
const productController = require('../controllers/admin/productController')
const brandController = require('../controllers/admin/brandController')
const orderController = require('../controllers/admin/orderController')
const couponController = require('../controllers/admin/couponController')
const offerController = require('../controllers/admin/offerController')

//Login Admin
admin_route.get('/',adminController.loadAdminLogin)
admin_route.post('/adm-login',adminController.adminLogin)
admin_route.get('/dashboard',adminAuth.isLogged,adminController.adminHome)
admin_route.post("/adminLogout", adminController.adminLogout);
admin_route.get('/export-sales-report/pdf',adminAuth.isLogged,adminController.downloadPdf)
admin_route.get('/export-sales-report/excel',adminAuth.isLogged,adminController.downloadExcel);
//Users Mangagement
admin_route.get('/users',adminAuth.isLogged,usersContorller.loadUsers)
admin_route.get('/blockUser/:id',usersContorller.blockUser)
admin_route.get('/unblockUser/:id',usersContorller.unblockUser)

//Category Management
admin_route.get('/categories',adminAuth.isLogged,categoryController.loadCategory)
admin_route.post('/edit-category/:id',categoryController.editCategory)
admin_route.post('/add-category',categoryController.addCategory)
admin_route.post('/delete-category',categoryController.deleteCategory)
admin_route.post('/apply_category/:categoryId', categoryController.applyCategory)
// Brand Management
admin_route.get('/brands',adminAuth.isLogged,brandController.loadBrand)
admin_route.post('/edit-brand/:id',brandController.editBrand)
admin_route.post('/add-brand',brandController.addBrand)
admin_route.post('/delete-brand',brandController.deleteBrand)

// Product Mangement
admin_route.get('/products',adminAuth.isLogged,productController.loadProducts)
admin_route.get('/add_product',productController.loadAddProduct)
admin_route.post('/add-product',upload.any(),productController.addProduct)
admin_route.get('/edit_product/:id',productController.editProductPage)
admin_route.post('/edit-product/:id', upload.array('productImages[]', 4),productController.editProduct);
admin_route.post('/delete_product/:id',productController.deleteProduct)
admin_route.post('/delete-image',productController.deleteImage)
admin_route.post('/apply_offer/:productId',adminAuth.isLogged,productController.applyOffer)

//order Management
admin_route.get('/orders',adminAuth.isLogged,orderController.loadOrderPage)
admin_route.post('/update-status/:id',orderController.updateStatus)
admin_route.get('/order-details/:orderId',orderController.loadOrderDetails)


//coupon Management
admin_route.get('/promocodes',adminAuth.isLogged,couponController.loadCoupon)
admin_route.post('/addCoupon',adminAuth.isLogged,couponController.addCoupon)
admin_route.put('/editCoupon/:id',adminAuth.isLogged,couponController.editCoupon)
admin_route.post('/deleteCoupon',adminAuth.isLogged, couponController.deleteCoupon)
//offer Management
admin_route.get ('/offers',adminAuth.isLogged,offerController.loadOffer)
admin_route.post('/addOffers',adminAuth.isLogged,offerController.addOffers)
admin_route.post('/editOffers',adminAuth.isLogged,offerController.editOffers)
admin_route.post('/deleteOffer',adminAuth.isLogged,offerController.deleteOffer)
admin_route.post('/restoreOffer',adminAuth.isLogged,offerController.restoreOffer)

admin_route.post('/orders/:orderId/respond-return', async (req, res) => {
  try {
      console.log('Hello');
      
    const orderId = req.params.orderId
    const { decision } = req.body 
   console.log("jdkakaka",decision)
    const order = await Orders.findById(orderId)

    if (order && order.return_request && order.admin_accepted === 'Pending') {
      order.admin_accepted = decision 
      await order.save()

      return res.redirect('/admin/orders') 
    } else {
      return res.status(404).send('Order not found or return request invalid')
    }
  } catch (error) {
    return res.status(500).send('Server error')
  }
})

module.exports = admin_route