const mongoose = require('mongoose')
const {Schema } = mongoose

const productSchema = new Schema({
    product_name:{
        type:String,
        required:true
    },
    category_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    brand_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Brand',
        required:true
    },
    varients:[{
        stocks:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        size:{
            type:Number,
            required:true
        },
        color:{
            type:String,
            required:true
        }
    }],
    description:{
        type:String,
    },
    images:[{
        type:String,
        required:true
    }],
    is_delete:{
        type:Boolean,
        default:'false'
    }
},{timestamps:true})

const Product = mongoose.model('Product',productSchema)
module.exports = Product;