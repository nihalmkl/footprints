
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const Cart = require('../../models/cartSchema')


exports.loadCart =  async (req, res) => {
    console.log('hello')
    const { userId } = req.params
    console.log(userId)
    
    try {
        console.log("hsjaguijdh")
        
        const cart = await Cart.findOne({ user_id: userId }).populate('items.product_id')
        console.log(cart)
        // if (!cart) {
        //     return res.status(404).json({ message: 'Cart not found' })
        // }
        let products
        if(cart){
            products = cart.items.map(item => {
                return {
                    ...item.product_id._doc, 
                    quantity: item.quantity,  
                    price: item.price        
                }
            })
        }
        
        res.render('user/cart', { cart ,products})
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}


exports.addCart = async (req, res) => {
    console.log('hi')
    const { userId, productId, quantity } = req.body;
    const quant = parseInt(quantity, 5);
    console.log(req.body    )
    if (quant === 0) {
        return res.status(400).json({ success:false,message: 'Quantity Atleast one' });
    }
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success:false,message: 'Product not found' });
        }

        if (product.variants[0].stock < quant ) {
            return res.status(400).json({success:false, message: 'Insufficient stock available' });
        }

        let cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            cart = new Cart({
                user_id: userId,
                items: [],
                total_price: 0
            });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product_id.toString() === productId);

        if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quant;

            if (newQuantity > product.variants[0].stock ) {
                return res.status(400).json({ message: 'Insufficient stock for the updated quantity' });
            }
            if(newQuantity>5){
                return res.status(400).json({success:false,message:"Maximum quantity reached"})
            }

            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].price = product.variants[0].price * newQuantity;
        } else {
            cart.items.push({
                product_id: productId,
                quantity: quant,
                price: product.variants[0].price * quant
            });
        }

        cart.total_price = cart.items.reduce((total, item) => total + item.price, 0);
        await cart.save();

        product.variants[0].stock -= quant;
        await product.save();

        res.status(200).json({success:true, message: 'Product added to cart', cart });
    } catch (error) {
        console.log('hello')
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.deleteCartItems = async (req, res) => {
    const { userId, productId } = req.body

    try {
        const cart = await Cart.findOne({ user_id: userId })
        if (!cart) {
            return res.status(404).json({success:false, message: 'Cart not found' })
        }

        const itemIndex = cart.items.findIndex(item => item.product_id.toString() === productId)

        if (itemIndex === -1) {
            return res.status(404).json({success:false, message: 'Product not found in cart' })
        }

        const removedItem = cart.items[itemIndex]

        const product = await Product.findById(productId)
        if (product) {
            product.variants[0].stock += removedItem.quantity
            await product.save()
        }

        cart.items.splice(itemIndex, 1);
        cart.total_price = cart.items.reduce((total, item) => total + item.price, 0)

        await cart.save()

        res.status(200).json({ success:true,message: 'Product removed from cart', cart })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success:false,message: 'Server error' })
    }
};
