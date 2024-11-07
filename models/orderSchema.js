const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const OrdersSchema = new Schema(
  {
    order_id: {
      type: String,
      unique: true,
      required: true,
    },
    
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User" 
    },
    address_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Address" 
    },
    order_status: {
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled','Returned'],
      default: 'Pending' 
    },
    items: [{
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      discount:{
        type:Number,
        default:0,
      }
    }],
    coupon_applied: {  
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: false
  },
    total_amount: {
      type: Number,
      required: true,
    },
    placed_at: {
      type: Date,
      default: Date.now 
    },
    payment_method: {
      type: String,
      required: true,
      enum: ['COD', 'card']
    },
    payment_status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed"], 
      default: 'Pending'
    },
    isCancelled:{
      type:Boolean,
      default:false
    },
    razorpay_id:{
      type:String,
      default:null,
      sparse:true
    },
  used_amount: {
      type: Number,
      default: 0
  },
  },
  { timestamps: true }
)

const Orders = mongoose.model("Orders", OrdersSchema);
module.exports = Orders;
