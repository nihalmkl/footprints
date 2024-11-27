const express = require('express')
const user_route = express.Router()
const passport = require('passport')

const userController = require('../controllers/user/userController')
const orderController = require('../controllers/user/orderController')
const cartController = require('../controllers/user/cartController')
const wishlistController = require('../controllers/user/wishlistController')
const profileController = require('../controllers/user/profileController')

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
user_route.get('/block-user',userController.blockedUser)

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
user_route.post('/order/place_order',orderController.placeOrder)
user_route.get('/orders', orderController.getOrder)
user_route.get('/order/:id',orderController.getOrderDetails)
user_route.post('/checkout_address/add',orderController.addCheckoutAddress)
user_route.post('/quantityUpdate',orderController.qantityUpdate)
user_route.post('/orders/:orderId/:itemId/request-return', orderController.returnProduct);
user_route.post('/apply-coupon',orderController.applyCoupon)
user_route.post('/addFund',userController.addFund)
user_route.post('/addFund/success',userController.addFundSuccess)
user_route.get('/wallet',userController.loadWallet)
user_route.get('/about', userController.loadAbout)
user_route.get('/contact', userController.loadContact)
user_route.post('/orders/:orderId/:itemId/cancel-order', orderController.cancelItem);
user_route.post('/order/verify_payment',orderController.verifyPayment)
user_route.get('/order/:orderId/invoice',orderController.downloadInvoice);
user_route.post('/complete-payment', orderController.rePayment)

// Endpoint to verify payment signature
user_route.post('/verify-payment/complete',orderController.verifyPaymentStatus)

user_route.patch('/order/payment_status/:orderId',orderController.updatePaymentStatus);
module.exports = user_route;