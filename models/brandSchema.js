const mongoose = require('mongoose')
const {Schema} = mongoose 

const brandSchema = new Schema({
    brand_name:{
        type:String,
        required:'true'
    },
    image:{
        type:String,
        required:'true'
    },
    is_delete:{
        type:Boolean,
        default:'false'
    }
},{timestamps:true})

const Brand = mongoose.model('Brand',brandSchema)
module.exports = Brand;
