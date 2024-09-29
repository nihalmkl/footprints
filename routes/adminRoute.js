const express = require('express')
const admin_route = express.Router()
// const auth = require('../middlewares/adminAuth')
const adminController = require('../controllers/admin/adminController')

admin_route.get('/',adminController.adminLogin)
// admin_route.post('/',auth.isLogout,adminController.adminLogin)
// admin_route.get('/dashboard',auth.isLogin,adminController.adminHome)
// admin_route.get("/logout",auth.isLogin,adminController.adminLogout)
admin_route.get('/home',adminController.loadAdminHome)

module.exports = admin_route