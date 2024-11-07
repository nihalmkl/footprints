
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const Address = require('../../models/addressSchema')
const Cart = require('../../models/cartSchema')
const Orders = require('../../models/orderSchema')
const Wishlist = require('../../models/wishlistSchema')
const Coupon = require('../../models/couponSchema')
const mongoose = require('mongoose')
const razorpay = require('../../config/razorpay')
const crypto = require('crypto')
exports.loadCheckout = async (req, res) => {
    const userId = req.user._id
    console.log(userId,"djfsjdfkf")
try { 
    let cartCount = []
    let wishlistCount = []

    if (req.session.user) {
        console.log("User ID:", req.session.user.id)

        cartCount = await Cart.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(req.session.user.id) } },
            { $project: { itemCount: { $size: "$items" } } }
        ])

        wishlistCount = await Wishlist.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(req.session.user.id) } },
            { $project: { itemCount: { $size: "$products" } } }
        ])
    }
     const coupons = await Coupon.find({ expiry_date: { $gte: new Date() } })
    const finalWishlistCount = wishlistCount.length > 0 ? wishlistCount[0].itemCount : 0
    const finalCartCount = cartCount.length > 0 ? cartCount[0].itemCount : 0
   const cart = await Cart.findOne({ user_id: userId }).populate('items.product_id');
   const addresses = await Address.find({ user_id: userId }) || []; 
    
   console.log("helllllooo",addresses)
   if (!cart) {
       return res.status(404).json({ message: "Cart not found" });
   }
   
   return res.render('user/checkout',{cart,addresses:addresses,userId,  wishlistCount: finalWishlistCount,
    cartCount: finalCartCount,coupons})
} catch (error) {
   console.error('Error fetching cart:', error.message);
   return res.status(500).json({ message: 'Server Error' });
}
}


function generateOrderId() {
const randomDigits = Math.floor(1000 + Math.random() * 9000)
return `ORD${randomDigits}`
}





exports.placeOrder = async (req, res) => {
        const { address_id, payment_method, payment_id, order_id, signature } = req.body;
    
        if (!address_id || !payment_method) {
        return res.status(400).json({ message: "Address and payment method are required." });
        }
    
        try {
        const userCart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id');
        if (!userCart) {
            return res.status(400).json({ message: "No cart found" });
        }
    
        const newOrder = new Orders({
            order_id: generateOrderId(),
            user_id: req.user._id,
            address_id,
            payment_method,
            items: userCart.items,
            total_amount: userCart.total_price
        });
    console.log("paisaaa",newOrder.total_amount)
        if (payment_method === "COD") {
            await newOrder.save();
    
            for (const item of userCart.items) {
            const product = await Product.findById(item.product_id);
            if (product && product.variants[0].stock >= item.quantity) {
                product.variants[0].stock -= item.quantity;
                await product.save();
            } else {
                return res.status(400).json({ message: `Insufficient stock for product: ${product.product_name}` });
            }
            }
    
            userCart.items = [];
            userCart.total_price = 0;
            await userCart.save();
    
            return res.status(200).json({ message: "Order placed successfully!" });
        } 
        else if (payment_method === "card") {
            const razorpayOrder = await razorpay.orders.create({
            amount: newOrder.total_amount * 100,
            currency: "INR",
            receipt: `receipt_${newOrder._id}`,
            });
    
            newOrder.razorpay_id = razorpayOrder.id;
            await newOrder.save();
    
            if (payment_id && order_id && signature) {
                console.log("payme",payment_id,"678888",order_id,signature)

            const isVerified = verifyPayment(payment_id, order_id, signature); 
            console.log("23",isVerified)
            if (isVerified) {
                userCart.items = [];
                userCart.total_price = 0;
                await userCart.save();

                return res.status(200).json({success:true, message: "Order placed successfully!", razorpayOrderId: razorpayOrder.id, amount: newOrder.total_amount });
            } else {
                console.log(333)
                return res.status(400).json({ message: "Payment verification failed." });
            }
            }
    
            return res.status(200).json({ message: "Proceed to Razorpay payment.", razorpayOrderId: razorpayOrder.id, amount: newOrder.total_amount });
        }
        } catch (error) {
        console.error("Error placing the order:", error);
        res.status(500).json({ message: "Failed to place the order." });
        }
    }
function verifyPayment(payment_id, order_id, signature) {
        const secret = process.env.RAZOR_PAY_KEY_SECRET
        const body = `${order_id}|${payment_id}`
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex')
        return expectedSignature === signature
    }




exports.getOrder = async (req, res) => {
try {
 const orders = await Orders.find({}).populate('items.product_id'); 
 res.json(orders);
} catch (error) {
 res.status(500).send({ message: 'Error fetching orders' });
}
}


exports.getOrderDetails = async (req, res) => {
try {
    
   const orderId = req.params.id;

   const order = await Orders.findById(orderId).populate('items.product_id')
   if (!order) {
    return res.status(404).send({ message: 'Order not found' })
}
   console.log("nihalee",order)
   const addressDocument = await Address.findOne({ '_id': order.address_id })
   console.log("ni",addressDocument)
 if (!addressDocument) {
     return res.status(404).send({ message: 'Address not found' })
 }
 let cartCount = []
    let wishlistCount = []

    if (req.session.user) {
        console.log("User ID:", req.session.user.id)

        cartCount = await Cart.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(req.session.user.id) } },
            { $project: { itemCount: { $size: "$items" } } }
        ])

        wishlistCount = await Wishlist.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(req.session.user.id) } },
            { $project: { itemCount: { $size: "$products" } } }
        ])
    }

    const finalWishlistCount = wishlistCount.length > 0 ? wishlistCount[0].itemCount : 0
    const finalCartCount = cartCount.length > 0 ? cartCount[0].itemCount : 0

 res.render('user/order-view', { order, address: addressDocument , wishlistCount: finalWishlistCount,
    cartCount: finalCartCount})
} catch (error) {
   console.error(error);
   res.status(500).send({ message: 'Error fetching order details' })
}
}


exports.cancelOrder = async (req, res) => {
try {
   const orderId = req.params.id;
   const order = await Orders.findById(orderId).populate('items.product_id');
   if (!order) {
       return res.status(404).json({ error: 'Order not found' });
   }

   order.order_status = 'Cancelled';
   await order.save();

   for (const item of order.items) {
       const product = await Product.findById(item.product_id);

       if (!product) {
           console.error(`Product not found for ID: ${item.product_id}`);
           continue;
       }

       const variantUpdate = product.variants.find(variant => variant.size === item.size);
       console.log(variantUpdate)
       if (variantUpdate) {
           variantUpdate.stock += item.quantity;
       }

       await product.save();
   }

   res.status(200).json({ message: 'Order cancelled successfully' });

} catch (error) {
   console.error('Error cancelling order:', error);
   res.status(500).json({ error: 'cancel the order Failed' });
}
}

exports.qantityUpdate = async (req, res) => {

const { product_id, quantity } = req.body; 

try {
   const cart = await Cart.findOne({ user_id: req.user._id });
   if (!cart) {
       console.log('Cart not found!');
       return res.status(404).send('Cart not found');
   }

   const item = cart.items.find(item => item._id.toString() === product_id);
   console.log(item)
   if (!item) {
       console.log('Item not found in the cart!');
       return res.status(404).send('Item not found');
   }

   item.quantity = quantity;

   cart.total_price = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

   await cart.save();

   res.json({ total_price: cart.total_price });
} catch (error) {
   console.error('Error updating cart:', error);
   res.status(500).send('Internal Server Error');
}
}

exports.returnProduct = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const itemId = req.params.itemId

        const order = await Orders.findOneAndUpdate(
            { _id: orderId, 'items._id': itemId },
            { $set: { order_status: 'Returned' } },
            { new: true } 
        );

        if (!order) {
            return res.status(404).json({ message: 'Order or item not found' })
        }
        
        res.status(200).json({ message: 'Return request submitted successfully', order })
    } catch (error) {
        console.error("Error in return request:", error)
        res.status(500).json({ message: 'Internal server error' })
    }
}


exports.applyCoupon = async (req, res) => {
    try {
        console.log(req.body)
      const { couponCode,totalPrice  } = req.body

      const coupon = await Coupon.findOne({ coupon_code: couponCode })
      console.log('hii',coupon)
      if (!coupon) {
        return res.json({ success: false, message: 'Invalid coupon code' })
      }
  
      const now = new Date()
      if (now < coupon.start_date || now > coupon.expiry_date) {
        return res.json({ success: false, message: 'Coupon is expired or not active' })
      }
      console.log("345",now)
  
      console.log("tot",totalPrice)
      if (totalPrice < coupon.min_pur_amount) {
        return res.json({ success: false, message: `Minimum purchase of ₹${coupon.min_pur_amount} required` })
      }
  
      // Calculate discount and apply max limit if necessary
      let discount = (totalPrice * coupon.discount) / 100
      console.log("dis",discount)
      if (coupon.max_coupon_amount && discount > coupon.max_coupon_amount) {
        discount = coupon.max_coupon_amount
      }
  
      const newTotal = totalPrice - discount
      console.log(newTotal)
  
      res.json({ success: true, newTotal,discount })
    } catch (error) {
      console.error('Error applying coupon:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
  