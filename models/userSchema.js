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
        unique:true,
        validate: {
            validator: function(v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
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
    },
    referralId: {
        type: String,
        unique: true
    },
    refferedById: {
        type: String,
    },
},{timestamps:true})
   
const User = mongoose.model('User',userSchema)
module.exports = User;