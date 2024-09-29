// const User = require('../../models/userSchema')
// const bcrypt = require('bcrypt')

exports.adminLogin = (req,res)=>{
    // const {email,password} = req.body
    // const admin = await User.findOne({email})
    // if(!admin){

    // }
    res.render('admin/login')
}

exports.loadAdminHome = async(req,res)=>{
    try{
        res.render('admin/category', { layout: 'layout/admin', title: 'Admin Home' });
    }catch(error){
        console.log(error)
    }
   
}