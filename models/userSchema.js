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
    },
    password:{
        type:String,
        required:false,
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