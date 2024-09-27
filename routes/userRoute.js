const express = require('express')
const user_route = express.Router()
const userController = require('../controllers/user/userController')




user_route.get('/', userController.loadHome);
user_route.get('/login', userController.loadLogin);
// router.post('/login',userController.verifyLogin)
user_route.get('/signup', userController.loadSignUp);
// router.post('/register', userController.registerUser);






module.exports = user_route;