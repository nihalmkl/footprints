const  mongoose = require('mongoose')
const  {Schema} = mongoose

const couponSchema = new Schema({
    coupon_code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    expiry_date: {
        type: Date,
        required: true
    },
    users: [{    
        userId: {        
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            },    
            isBought: {        
                type: Boolean,        
                default: false    
            }
        }],

    min_pur_amount: {
        type: Number,
        default: 0
    },
    description : {
        type: 'string',
        required: true
    },
    status:{
        type:Boolean,
        required:true,
        default:false
    }
},{timestamps:true})

const Coupon = mongoose.model('Coupon',couponSchema)
module.exports = Coupon