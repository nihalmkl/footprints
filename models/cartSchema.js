const mongoose = require('mongoose')
const {Schema} = mongoose

const cartSchema = new Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    items:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        quantity:{
            type:Number,
            required:true,
        },
        price:{
            type:Number,
            required:true,
        }
    }],
     total_price:{
        type:Number,
     }
},{timestamps:true})

const Cart = mongoose.model('Cart',cartSchema)
module.exports = Cart
