const mongoose = require('mongoose')
const {Schema} = mongoose

const categoryShema = new Schema({
    category_name:{
        type:String,
        required:'true'
    },
    is_delete:{
        type:Boolean,
        default:'false'
    }
},{timestamps:true})

const Category = mongoose.model('Category',categoryShema)
module.exports = Category;