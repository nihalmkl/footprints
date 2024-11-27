
const User = require('../../models/userSchema')
const env  = require('dotenv').config()
const Address = require('../../models/addressSchema')
const Cart = require('../../models/cartSchema')
const Wishlist = require('../../models/wishlistSchema')
const mongoose = require('mongoose')

// <------------------------ This for edit address---------------------------->
exports.editAddress = async (req, res) =>{
    const { full_name, street_address, pincode, city, state, country, phone } = req.body;
    const addressId = req.params.addressId;
    try {
      const addressRecord = await Address.findOneAndUpdate(
        { _id: addressId, user_id: req.user._id }, 
        {
          $set: {
            full_name,
            street_address,
            pincode,
            city,
            state,
            country,
            phone,
          }
        }
      );
  
      if (!addressRecord) {
        return res.status(404).send('Address not found');
      }
  
      res.redirect('/profile/' + req.user._id);  
    } catch (error) {
      console.error(error)
      res.status(500).send('Error updating address');
    }
  }

// <------------------------ This for add address---------------------------->

  exports.addAddress = async (req, res) => {
    const { full_name, street_address, pincode, city, state, country, phone } = req.body
  
    if (!full_name || !street_address || !pincode || !city || !state || !country || !phone) {
      return res.status(400).send('All fields are required.');
    }
  
    try {
      const newAddress = new Address({
        full_name,
        street_address,
        pincode,
        city,
        state,
        country,
        phone,
        user_id: req.user._id  
      });
      
      
      
      await newAddress.save();
  
      
      res.redirect('/profile/' + req.user._id);
      
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding address');
    }
  };
  
  // <------------------------ This for load profile page---------------------------->

  exports.loadProfile = async (req, res) => {
    try {
      let cartCount = []
        let wishlistCount = []

        if (req.session.user) {

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

      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const addresses = await Address.find({ user_id: userId }) || []; 
      
      res.render('user/profile', { user, addresses,  wishlistCount: finalWishlistCount,
        cartCount: finalCartCount });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  };

// <------------------------ This for edit profile data---------------------------->

  exports.editProfile = async (req, res) => {
  
    const { username, phone } = req.body;
    const userId = req.params.userId; 
    
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, phone},
            { new: true} 
        );
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.redirect('/profile/' + userId);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Server error');
    }
};

// <------------------------ This for delete address---------------------------->
exports.deleteAddress = async (req, res) => {
  const addressId = req.params.id
  const userId = req.user._id

  try {
      const addressRecord = await Address.findOneAndDelete({ _id: addressId, user_id: userId })

      if (!addressRecord) {
          return res.status(404).json({ message: 'Address not found.' })
      }

      res.status(200).json({ message: 'Address deleted successfully.' })
  } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error deleting address.' })
  }
}



