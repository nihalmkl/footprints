const express = require('express')
const user_route = express.Router()
const passport = require('passport')
const userController = require('../controllers/user/userController')

user_route.get('/', userController.loadHome)
user_route.get('/login', userController.loadLogin);
// router.post('/login',userController.login)

user_route.get('/register', userController.loadRegister);
user_route.post('/register', userController.register);
// user_route.get('/forgot_password', userController.forgotPass)

// router.post('/verify-otp', userController.)
// router.post('/resend-otp',userController.resendOtp)

user_route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
user_route.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/login' }),(req, res) => {
      res.redirect('/')});
user_route.get('/shop',userController.loadShop)
user_route.get('/about',userController.loadAbout)
user_route.get('/contact',userController.loadContact)
user_route.get('/product-view',userController.productView)

module.exports = user_route;