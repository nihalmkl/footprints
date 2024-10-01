
const mongoose = require('mongoose')
const {Schema} = mongoose

const otpSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    otp:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    }
})
 otpSchema.index({createdAt:1},{expireAfterSeconds:60})    
const Otp = mongoose.model('Otp',otpSchema)
module.exports = Otp