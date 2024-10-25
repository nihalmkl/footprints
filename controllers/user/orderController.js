
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const Address = require('../../models/addressSchema')
const Cart = require('../../models/cartSchema')
const Orders = require('../../models/orderSchema')
const config = require('../../config/razorpay')
const Razorpay = require('razorpay')

exports.loadCheckout = async (req, res) => {
    const userId = req.user._id
try { 
   const cart = await Cart.findOne({ user_id: userId }).populate('items.product_id');
   const addresses = await Address.find({ user_id: userId }) 
           console.log(cart);
           
   if (!cart) {
       return res.status(404).json({ message: "Cart not found" });
   }
   const userAddresses = addresses ? addresses.address : []
   return res.render('user/checkout',{cart,addresses:userAddresses,userId})
} catch (error) {
   console.error('Error fetching cart:', error.message);
   return res.status(500).json({ message: 'Server Error' });
}
}


function generateOrderId() {
const randomDigits = Math.floor(1000 + Math.random() * 9000)
return `ORD${randomDigits}`
}


const razorpay = new Razorpay({
  key_id: config.razorpay.key_id,
  key_secret: config.razorpay.key_secret,
});

exports.placeOrder = async (req, res) => {
    console.log("hello placc")
  const { address_id, payment_method } = req.body;
  console.log(address_id);
  
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

          const payout = await createRazorpayXPayout(newOrder, req.user);

          return res.status(200).json({ message: "Order placed successfully! Payout initiated.", payout });
      } else {
        console.log('hello my friend')
          const razorpayOrder = await razorpay.orders.create({
              amount: newOrder.total_amount * 100,
              currency: "INR",
              receipt: `receipt_${newOrder._id}`,
          });

          newOrder.razorpay_id = razorpayOrder.id;
          await newOrder.save();

          return res.status(200).json({
              message: "Proceed to Razorpay payment.",
              razorpayOrderId: razorpayOrder.id,
              amount: newOrder.total_amount
          });
      }
  } catch (error) {
      console.error("Error placing the order:", error);
      res.status(500).json({ message: "Failed to place the order." });
  }
}
async function createRazorpayXPayout(order, user) {
  try {
      const payoutOptions = { 
          fund_account_id: user.fundAccountId, 
          amount: order.total_amount * 100,  
          currency: "INR",
          mode: "IMPS",
          purpose: "payout",
          reference_id: `order_${order._id}`,
          narration: `Payout for order ${order._id}`,
      };

      const payout = await razorpay.payouts.create(payoutOptions);
      console.log("Payout successful:", payout);
      return payout;
  } catch (error) {
      console.error("Error creating payout:", error);
      throw new Error("Payout failed");
  }
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
   console.log(order)
   const addressDocument = await Address.findOne({ 'address._id': order.address_id })

 if (!addressDocument) {
     return res.status(404).send({ message: 'Address not found' })
 }

 const address = addressDocument.address[0]
   if (!order) {
       return res.status(404).send({ message: 'Order not found' })
   }
     res.render('user/order-view', { order,address})
} catch (error) {
   console.error(error);
   res.status(500).send({ message: 'Error fetching order details' })
}
}


exports.cancelOrder = async (req, res) => {
try {
   const orderId = req.params.id;
    console.log("nihal",orderId)
   const order = await Orders.findById(orderId).populate('items.product_id');
   console.log("sha",order)
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