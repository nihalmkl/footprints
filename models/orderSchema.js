const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const OrdersSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User" 
    },
    order_status: {
      type: String,
      required: true,
    },
    address_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Address" 
    },
    items: [
      {
        item_status: { 
          type: String,
          required: true 
        },
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
          required: false,
        },
        discount_percentage: {
          type: Number,
          required: false,
        },
      },
    ],
    payments: [
      {
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          required: true,
          default: Date.now 
        },
        payment_id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        payment_method: {
          type: String,
          required: true,
        },
        payment_status: {
          type: String,
          required: true,
          enum: ["Pending", "Completed", "Failed"], 
        },
      },
    ],
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", OrdersSchema);
module.exports = Orders;
