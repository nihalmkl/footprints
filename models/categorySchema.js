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
    },
    offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Offer'
    },
},{timestamps:true})

const Category = mongoose.model('Category',categoryShema)
module.exports = Category;