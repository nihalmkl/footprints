 require('dotenv').config();

module.exports = {
  razorpay: {
    key_id: process.env.RAZORPAY_X_KEY_ID,
    key_secret: process.env.RAZORPAY_X_KEY_SECRET,
  }
};