const express = require('express')
const admin_route = express.Router()
const auth = require('../middlewares/adminAuth')
const adminController = require('../controllers/admin/adminController')

admin_route.get('/login',auth.isLogout,adminController.loginLoad)
admin_route.post('/login',auth.isLogout,adminController.adminLogin)
admin_route.get('/dashboard',auth.isLogin,adminController.adminHome)
admin_route.get("/logout",auth.isLogin,adminController.adminLogout)