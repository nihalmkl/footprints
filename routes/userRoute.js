const express = require('express')
const user_route = express.Router()
const passport = require('passport')
const userController = require('../controllers/user/userController')
const sessionChecker = require('../middlewares/sessionChecker');    

user_route.use(sessionChecker)

user_route.get('/', userController.loadHome)
user_route.get('/login', userController.loadLogin);
user_route.post('/login',userController.userLogin)
user_route.get('/logout',userController.userLogout)

user_route.get('/register', userController.loadRegister);
user_route.post('/register', userController.register);
user_route.get('/verify-otp', userController.verifyOtp);


user_route.post('/verify-otp', userController.verityOtp)
user_route.post('/resend-otp', userController.resendOtp)

user_route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
user_route.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/login' }),(req, res) => {
      req.session.user = {
            id: req.user._id, 
            email: req.user.email,
          };
      res.redirect('/')});

user_route.get('/shop',userController.loadShop)
user_route.get('/about',userController.loadAbout)
user_route.get('/contact',userController.loadContact)
user_route.get('/product-view/:id', userController.productView);

module.exports = user_route;