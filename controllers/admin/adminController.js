// const User = require('../../models/userSchema')
// const bcrypt = require('bcrypt')


exports.adminLogin = (req,res)=>{
    res.render('admin/login')
}

exports.loadAdminHome = async(req,res)=>{
    try {
        res.render('admin/dashboard',{layout:'layout/admin',title:'Dashboard'})
    } catch (error) {
        console.log(error)
    }
}






