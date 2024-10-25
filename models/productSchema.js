    const mongoose = require('mongoose');

    const productSchema = new mongoose.Schema({
        product_name: {
            type: String,
            required: true
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: true
        },
        description: {
            type: String,
            required: true
        },
        is_delete: {
            type: Boolean,
            default: false
        },
        images: [{
            type: String,
            required: true
        }], 
        variants: [{
            size: {
                type: String,
                required: true
            },
            stock: {
                type: Number,
                required: true,
                default: 0
            },
            price: {
                type: Number,
                required: true
            }
        }],
        discount_amount: {  
            type: Number,
            default: 0
        },
    },{timestamps:true});

    const Product = mongoose.model('Product', productSchema);
    module.exports = Product;
