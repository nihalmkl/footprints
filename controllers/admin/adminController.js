const User = require('../../models/userSchema')
const bcrypt = require('bcrypt')

// const adminLogin = async(req,res)=>{
//     const {email,password} = req.body
//     const admin = await User.findOne({email})
//     if(!admin){

//     }