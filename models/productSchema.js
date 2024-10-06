const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
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
    variants: [{
        stock: { // Changed from 'stocks'
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        images: {
            type: [String] // Array of image paths
        }
    }],
    description: {
        type: String
    },
    is_delete: {
        type: Boolean,
        default: false // Changed default to Boolean
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
