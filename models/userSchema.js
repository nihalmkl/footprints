const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    username:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:false,
        unique:true,
        sparse:true,
        default:null
    },
    password:{
        type:String,
        required:false,
        sparse:true,
    },
    googleId:{
        type:String,
        unique:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
},{timestamps:true})
   
const User = mongoose.model('User',userSchema)
module.exports = User;