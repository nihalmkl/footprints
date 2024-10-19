const express = require('express')
const user_route = express.Router()
const passport = require('passport')
const userController = require('../controllers/user/userController')
const session = require('../middlewares/sessionChecker');    
const Orders = require('../models/orderSchema')
const Product = require('../models/productSchema')
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
//  user_route.get('/shop/category/:categoryId', userController.serachCategory)
 user_route.get('/about', userController.loadAbout)
 user_route.get('/contact', userController.loadContact)
 user_route.get('/product-view/:id', userController.productView) 
 user_route.delete('/delete-address/:id',userController.deleteAddress);
 user_route.get('/checkout',userController.loadCheckout)
 user_route.post('/place-order',userController.placeOrder)
 user_route.get('/orders', userController.getOrder)
 user_route.get('/order/:id',userController.getOrderDetails)
user_route.put('/orders/:id',userController.cancelOrder)
user_route.post('/quantityUpdate', async (req, res) => {
      if (!req.user) {
            return res.status(401).send('User not authenticated');
        }
        
      const { product_id, quantity } = req.body; 
    
      try {
          const cart = await Cart.findOne({ user_id: req.user._id });
          if (!cart) {
              console.log('Cart not found!');
              return res.status(404).send('Cart not found');
          }
  
          const item = cart.items.find(item => item._id.toString() === product_id);
          console.log(item)
          if (!item) {
              console.log('Item not found in the cart!');
              return res.status(404).send('Item not found');
          }
  
          item.quantity = quantity;
  
          cart.total_price = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
          await cart.save();
  
          res.json({ total_price: cart.total_price });
      } catch (error) {
          console.error('Error updating cart:', error);
          res.status(500).send('Internal Server Error');
      }
  });
  
module.exports = user_route;