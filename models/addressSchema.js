const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema({
  address:[{
    full_name: {
      type: String,
      required: true,
    },
    street_address: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
  }],
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },{ timestamps: true });

const Address = mongoose.model('Address',addressSchema)
module.exports = Address