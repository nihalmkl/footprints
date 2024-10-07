
const User = require('../models/userSchema')

exports.isLogged = (req,res,next)=>{
    if(!req.session.admin){
        res.redirect('/admin/');
    }else{
        next()
    }
}