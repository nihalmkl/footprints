const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    username:{
        type:String,
        required:true
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
    role:{
        type:[String],
        enum:['user','admin'],
        default:"user"
    },
},{timestamps:true})
   
const User = mongoose.model('User',userSchema)
module.exports = User;