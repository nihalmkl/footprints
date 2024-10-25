
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const Wishlist = require('../../models/wishlistSchema')


exports.loadWishlist = async (req, res) => {
    const {userId} = req.params
    console.log(userId)

    try {
        const wishlist = await Wishlist.findOne({ user_id: userId }).populate('products.product_id');

        if (!wishlist || wishlist.products.length === 0) {
            return res.render('wishlist', { products: [], message: 'Your wishlist is empty.' });
        }

        const products = wishlist.products.map(item => item.product_id);
        res.render('user/wishlist', { products });
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
    console.log(userId)
    console.log(req.body,"djakjdhdak")

    try {
        const wishlist = await Wishlist.findOne({ user_id: userId })
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' })
        }

        wishlist.products = wishlist.products.filter(item => item.product_id.toString() !== productId)
        await wishlist.save();

        res.status(200).json({ success: true, message: 'Product removed from wishlist' })
    } catch (error) {
        console.error('Error removing from wishlist:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}
