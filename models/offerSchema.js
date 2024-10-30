const mongoose = require('mongoose')

const {Schema} = mongoose

const offerSchema = new Schema({
    
    offer_name:{
        type:String,
        required:true
    },
    discount_percentage: {
        type: Number,
        required: true
    },
    start_date: {
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