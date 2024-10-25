const express = require('express')
const user_route = express.Router()
const passport = require('passport')

const userController = require('../controllers/user/userController')
const orderController = require('../controllers/user/orderController')
const cartController = require('../controllers/user/cartController')
const wishlistController = require('../controllers/user/wishlistController')
const profileController = require('../controllers/user/profileController')

const Orders = require('../models/orderSchema')
const session = require('../middlewares/sessionChecker');    

user_route.get('/login', userController.loadLogin)
user_route.post('/login', userController.userLogin)
user_route.get('/register', userController.loadRegister)
user_route.post('/register', userController.register)
user_route.get('/verify-otp', userController.verifyOtp)
user_route.post('/verify-otp', userController.verityOtp)
user_route.post('/resend-otp', userController.resendOtp)
user_route.get('/forgot-password', userController.forgotPage)
user_route.post('/forgot-password', userController.forgotPassword)
user_route.get('/reset-password/:token', userController.resetPasswordPage)
user_route.post('/reset-password', userController.resetPassword)

user_route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
user_route.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/login' }),(req, res) => {
      req.session.user = {
            id: req.user._id, 
            email: req.user.email,
          };
      res.redirect('/')})


 user_route.get('/',session.sessionLogin,userController.loadHome) 
 user_route.get('/shop',session.sessionLogin, userController.loadShop)
 
 user_route.use(session.sessionChecker)

 user_route.get('/logout', userController.userLogout)
 user_route.get('/profile/:userId', profileController.loadProfile)
 user_route.post('/address/add-address', profileController.addAddress)
 user_route.post('/address/:addressId', profileController.editAddress)
 user_route.post('/profile/:userId', profileController.editProfile)
 user_route.delete('/delete-address/:id',profileController.deleteAddress)
 user_route.get('/product-view/:id', userController.productView) 

 user_route.get('/cart/:userId', cartController.loadCart)
 user_route.post('/cart/add',cartController.addCart)
 user_route.post('/cart/remove',cartController.deleteCartItems)

 user_route.post('/wishlist/add',wishlistController.addWishlist)
 user_route.get('/wishlist/:userId', wishlistController.loadWishlist)
 user_route.post('/wishlist/remove',wishlistController.removeWishlistItem)


user_route.get('/checkout',orderController.loadCheckout)
user_route.post('/place-order',orderController.placeOrder)
user_route.get('/orders', orderController.getOrder)
user_route.get('/order/:id',orderController.getOrderDetails)
user_route.put('/orders/:id',orderController.cancelOrder)
user_route.post('/quantityUpdate',orderController.qantityUpdate)
  
user_route.get('/about', userController.loadAbout)
user_route.get('/contact', userController.loadContact)

user_route.post('/orders/:orderId/request-return', async (req, res) => {
      try {
        const orderId = req.params.orderId
        const { return_reason } = req.body
    
        const order = await Orders.findById(orderId)
    
        if (order) {
          if (!order.return_request) {
            order.return_request = true
            order.return_reason = return_reason
            order.admin_accepted = 'Pending' // Set status to pending
            await order.save()
    
            // Notify admin (this can be an email or message in admin panel)
            // Example: Notify the admin by setting up an admin notification system
    
            return res.redirect(`/orders/${orderId}`)
          } else {
            return res.status(400).send('Return already requested')
          }
        } else {
          return res.status(404).send('Order not found')
        }
      } catch (error) {
        return res.status(500).send('Server error')
      }
    })
module.exports = user_route;