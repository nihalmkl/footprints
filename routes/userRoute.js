const express = require('express')
const user_route = express.Router()
const passport = require('passport')
const userController = require('../controllers/user/userController')
const sessionChecker = require('../middlewares/sessionChecker');    
const Address = require('../models/addressSchema')
const Cart = require('../models/cartSchema')

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
      res.redirect('/')});

 user_route.use(sessionChecker)

 user_route.get('/', userController.loadHome)
 user_route.get('/logout', userController.userLogout)
 user_route.get('/profile/:userId', userController.loadProfile)
 user_route.post('/address/add-address', userController.addAddress)
 user_route.post('/address/:addressId', userController.editAddress)
 user_route.post('/profile/:userId', userController.editProfile)
 user_route.get('/cart/:userId', userController.loadCart)
 user_route.post('/cart/add',userController.addCart)
 user_route.post('/cart/addOne',userController.addCart)
 user_route.post('/cart/remove',userController.deleteCartItems)
 user_route.post('/wishlist/add',userController.addWishlist)
 user_route.get('/wishlist/:userId', userController.loadWishlist)
 user_route.post('/wishlist/remove',userController.removeWishlistItem)
 user_route.get('/shop', userController.loadShop)
 user_route.get('/about', userController.loadAbout)
 user_route.get('/contact', userController.loadContact)
 user_route.get('/product-view/:id', userController.productView) 
 user_route.delete('/delete-address/:id',userController.deleteAddress);
 user_route.get('/checkout', async (req, res) => {
      
      try {
          const userId = req.user._id
          const cart = await Cart.findOne({ user_id: userId });
          const addresses = await Address.findOne({ user_id: userId }) || []; 
                  console.log(cart);
                  
          if (!cart) {
              return res.status(404).json({ message: "Cart not found" });
          }
          const userAddresses = addresses ? addresses.address : []
         return res.render('user/checkout',{cart,addresses:userAddresses,userId})
      } catch (error) {
          console.error('Error fetching cart:', error.message);
          return res.status(500).json({ message: 'Server Error' });
      }
  });
  

module.exports = user_route;