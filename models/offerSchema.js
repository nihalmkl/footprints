const mongoose = require('mongoose')

const {Schema} = mongoose

const offerSchema = new Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    category_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    offer_title: {
        type: String,
        required: true
    },
    discount_percentage: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    exp_date: {
        type: Date,
        required: true
    },
    is_delete:{
        type:Boolean,
        required:true,
        default:false
    }
},{timestamps:true})

const Offer = mongoose.model('Offer',offerSchema)

module.exports = Offer