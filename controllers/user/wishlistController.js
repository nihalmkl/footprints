
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const Wishlist = require('../../models/wishlistSchema')
const Cart = require('../../models/cartSchema')
const mongoose = require('mongoose')

exports.loadWishlist = async (req, res) => {
    const {userId} = req.params

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

        const finalWishlistCount = wishlistCount.length > 0 ? wishlistCount[0].itemCount : 0
        const finalCartCount = cartCount.length > 0 ? cartCount[0].itemCount : 0
        const wishlist = await Wishlist.findOne({ user_id: userId }).populate('products.product_id');

        if (!wishlist || wishlist.products.length === 0) {
            return res.render('user/wishlist', { products: [], message: 'Your wishlist is empty.' });
        }

        const products = wishlist.products.map(item => item.product_id);
        res.render('user/wishlist', { products,  wishlistCount: finalWishlistCount,
            cartCount: finalCartCount });
    } catch (error) {
        console.error('Error loading wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


exports.addWishlist = async (req, res) => {
    const { userId, productId } = req.body


    try {
        let wishlist = await Wishlist.findOne({ user_id: userId })

        if (!wishlist) {
            wishlist = new Wishlist({ user_id: userId, products: [] })
        }

        const productExists = wishlist.products.some(item => item.product_id.toString() === productId)

        if (productExists) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' })
        }

        wishlist.products.push({ product_id: productId })
        await wishlist.save()

        res.status(200).json({ success: true, message: 'Product added to wishlist' })
    } catch (error) {
        console.error('Error adding to wishlist:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

exports.removeWishlistItem =  async (req, res) => {
    const { productId} = req.body
    const userId = req.session.user.id

    try {
        const wishlist = await Wishlist.findOne({ user_id: userId })
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' })
        }

        wishlist.products = wishlist.products.filter(item => item.product_id.toString() !== productId)
        await wishlist.save();

        res.status(200).json({ success: true, message: 'Product removed from wishlist' })
    } catch (error) {
       
        res.status(500).json({ success: false, message: 'Server error' })
    }
}
