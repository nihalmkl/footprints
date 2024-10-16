const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const OrdersSchema = new Schema(
  {
    order_id: {
      type: String,
      unique: true,
      required: true,
    },
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
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
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending' 
    },
    items: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        purchased_price: {
          type: Schema.Types.Decimal128,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    promocode_info: [
      {
        code: {
          type: String,
        },
        discount_percentage: {
          type: Number,
        },
      },
    ],
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
      enum: ['Cash on Delivery', 'Bank Transfer']
    },
    delivery_charge: {
      type: Number,
      default: 0
    },
    payment_status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed"], 
      default: 'Pending'
    },
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", OrdersSchema);
module.exports = Orders;
