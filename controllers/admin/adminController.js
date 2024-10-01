// const User = require('../../models/userSchema')
// const bcrypt = require('bcrypt')

exports.adminLogin = (req,res)=>{
    res.render('admin/login')
}

exports.loadAdminHome = async(req,res)=>{
    try{
        res.render('admin/products', { layout: 'layout/admin', title: 'Admin Home' });
    }catch(error){
        console.log(error)
    }
   
}