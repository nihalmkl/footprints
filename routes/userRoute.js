const express = require('express')
const user_route = express.Router()
const passport = require('passport')
const userController = require('../controllers/user/userController')
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
 user_route.get('/products/search', userController.searchProducts)

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
 user_route.get('/profile/:userId', userController.loadProfile)
 user_route.post('/address/add-address', userController.addAddress)
 user_route.post('/address/:addressId', userController.editAddress)
 user_route.post('/profile/:userId', userController.editProfile)
 user_route.get('/cart/:userId', userController.loadCart)
 user_route.post('/cart/add',userController.addCart)
 user_route.post('/cart/remove',userController.deleteCartItems)
 user_route.post('/wishlist/add',userController.addWishlist)
 user_route.get('/wishlist/:userId', userController.loadWishlist)
 user_route.post('/wishlist/remove',userController.removeWishlistItem)

 user_route.get('/about', userController.loadAbout)
 user_route.get('/contact', userController.loadContact)
 user_route.get('/product-view/:id', userController.productView) 
 user_route.delete('/delete-address/:id',userController.deleteAddress);
 user_route.get('/checkout',userController.loadCheckout)
 user_route.post('/place-order',userController.placeOrder)
 user_route.get('/orders', userController.getOrder)
user_route.get('/order/:id',userController.getOrderDetails)

module.exports = user_route;