const nocache = require('nocache')
const User = require('../../models/userSchema')
const Otp = require('../../models/otpSchema')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const session = require('express-session')
const crypto = require('crypto') 
const Address = require('../../models/addressSchema')
const Cart = require('../../models/cartSchema')
const Wishlist = require('../../models/wishlistSchema')
const Orders = require('../../models/orderSchema')
exports.loadLogin =async (req,res) => {
    try {
        res.render('user/login')
    } catch (error) {
        console.log(error.message)
    }
   
}



    
exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });

        console.log(userData);

        if (!userData) {
            console.log("User not found");
            return res.json({ success: false, message: "User doesn't exist. Enter a valid email." });
        }

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.json({ success: false, message: "Password doesn't match." });
        }
        req.session.user = {
            id: userData._id,
            email: userData.email,
        };

        console.log('Login successful');
        return res.json({ success: true });
        
    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



exports.loadHome = async (req, res) => {
    try {
        const products = await Product.find({is_delete:false});
        
        return res.render('user/home.ejs',{products});
    } catch (error) {
        console.error("Error loading home page:", error.message);
        return res.status(500).render('user/error', {
            message: 'Please try again later.',
            errorCode: 500
        });
    }
};



exports.loadRegister = async(req,res)=>{
    try {
        res.render('user/register')   
    } catch (error) {
        console.log('error:',error.message)
        res.status(500).render('user/error', {
            message: 'Please try again later.',
            errorCode: 500
        });
    }
}




exports. verifyOtp = (req,res)=>{
    res.render('user/verify_otp'); 
}

   function generateOtp(){
    return Math.floor(100000 + Math.random() * 900000)
   }
   async function sentVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            requireTLS: true,
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const info = await transporter.sendMail({ 
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP is ${otp}</b>`,
        });
        console.log("Email sent: ", info);
        return info.accepted.length > 0; 
    } catch (error) {
        console.error("Sending email failed", error);
        return false; 
    }
} 
exports.register = async (req, res) => {
    try {
        const { username,email,phone, password, confirm_password } = req.body;
        console.log(req.body)
        if (password !== confirm_password) {
            return res.render("user/register", { message: "Password doesn't match" });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("user/register", { message: "User already exists" });
        }

        const otp = generateOtp();
        req.session.userOtp = otp
        console.log('Generated OTP:', otp);

        const sentEmail = await sentVerificationEmail(email, otp);
        console.log('1')
        if (!sentEmail) {
            console.error("Email not sent");
            return res.json("Email not sent");
        }

        const recordOtp = new Otp({ email, otp });
        await recordOtp.save();
        req.session.userData = {username,email,phone,password}
         console.log("iqeriqwerio",req.session.userData)
        console.log('OTP sent:', otp);
        res.redirect('/verify-otp'); 
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).render('user/error', {
            message: 'Please try again later.',
            errorCode: 500
        });
    }
};
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    
    } catch (error) {
        console.log(error.message)
    }
}



exports.verityOtp = async (req,res)=>{
    try{
       
        console.log('hioadihfaosdhfaosdf')
        const {otpInput} = req.body
        console.log("this is user date",req.session.userData.email)
        const otpRecord = await Otp.findOne({email:req.session.userData.email})
       
        console.log("hiaoidfasdfhao",otpRecord.otp,"ufhushdasdhf",otpInput,"uwpihdaisdfhas")
       
        if(!otpRecord){
            return res.status(400).json({success:false,message:'OTP not found'})
        }

        if(String(otpInput) === String(otpRecord.otp)){
            console.log("checking 1")
            const user = req.session.userData
            const passwordHash = await securePassword(user.password)
            const newUser = new User({
                username:user.username,
                email:user.email,
                phone:user.phone,
                password:passwordHash,
            })
            await newUser.save()
            console.log("thish is user now",newUser)
            req.session.user =  newUser._id
            res.json({success:true,redirectUrl:'/login'})
        }else{
            res.status(400).json({success:false,message:'Invalid OTP,please try again'})
        }
    }catch(error){
        console.log("Error Verification OTP :",error)
    }
}


exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData;

        if (!email) {
            return res.status(400).json({ success: false, message: 'User session expired' });
        }

        
        const otp = generateOtp(); 
        req.session.userotp = otp; 

        await Otp.findOneAndDelete({ email });
        const resentotp = new Otp({
            email,
            otp,
        })

        await resentotp.save();
        console.log('New OTP saved:', otp);

        const sentEmail = await sentVerificationEmail(email, otp);

        if (sentEmail) {
            return res.status(200).json({ success: true, message: 'OTP resent successfully!' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
        }

    } catch (error) {
        console.error('Error in resending OTP:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


exports.loadShop = async (req, res) => {
    console.log(req.query);
    
    const { sorting } = req.query; 
    console.log(sorting)
    let sortOption = {}

    try {
        switch (sorting) {
            case 'priceLowToHigh':
                sortOption = { 'variants.price': 1 }
                break;
            case 'priceHighToLow':
                sortOption = { 'variants.price': -1 }
                break;
            case 'newArrivals':
                sortOption = { createdAt: -1 }
                break;
            case 'aToZ':
                sortOption = { product_name: 1 }
                break;
            case 'zToA':
                sortOption = { product_name: -1 }
                break;
            default:
                sortOption = {}
        }

        const products = await Product.find({ is_delete: false }).sort(sortOption)
        console.log(products)
        res.render('user/shop', { products: products })
    } catch (error) {
        console.log(error.message);
    }
}


exports.serachCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const products = await Product.find({ category_id: categoryId, is_delete: false }).populate('brand_id');

        res.render('user/shop', {
            products: products
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving products');
    }
}
exports.forgotPage = async (req,res)=>{
    try{
        res.render('user/forgot-pass')
    }catch(err){
        console.log(err);
        
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Email does not exist.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        req.session.resetToken = resetToken;
        req.session.email = email;

        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        console.log(resetUrl);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: user.email,
            subject: 'Password Reset',
            html: `<p>You requested for password reset</p><p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Reset link sent to your email.' });

    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

exports.resetPasswordPage = (req, res) => {
    const { token } = req.params;

    if (!req.session.resetToken || token !== req.session.resetToken) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
    res.render('user/reset-pass', { token });
};

exports.resetPassword = async (req, res) => {
    console.log(req.body);
    
    const { newPassword, token } = req.body;

    try {
        if (!req.session.resetToken || token !== req.session.resetToken) {
            return res.status(400).json({ success: false, message: 'Invalid token.' });
        }

        const user = await User.findOne({ email: req.session.email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        req.session.resetToken = null;
        req.session.email = null;

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};


exports.productView = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category_id').populate('brand_id');
        const relatedProducts = await Product.find({
            category_id: product.category_id,
            _id: { $ne: product._id } 
        }).limit(4);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('user/product_detail.ejs', { product ,relatedProducts});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};



exports.editAddress = async (req, res) =>{
    const { full_name, street_address, pincode, city, state, country, phone } = req.body;
    const addressId = req.params.addressId;
      console.log(addressId,"dklajioaj")
    try {
      const addressRecord = await Address.findOneAndUpdate(
        { "address._id": addressId, user_id: req.user._id }, 
        {
          $set: {
            "address.$.full_name": full_name,
            "address.$.street_address": street_address,
            "address.$.pincode": pincode,
            "address.$.city": city,
            "address.$.state": state,
            "address.$.country": country,
            "address.$.phone": phone,
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

exports.addAddress = async (req, res) =>{
    const { full_name, street_address, pincode, city, state, country, phone } = req.body;
  
    if (!full_name || !street_address || !pincode || !city || !state || !country || !phone) {
      return res.status(400).send('All fields are required.');
    }
  
    try {
      let addressRecord = await Address.findOne({ user_id: req.user._id });
      
      if (!addressRecord) {
        addressRecord = new Address({
          user_id: req.user._id,
          address: [{
            full_name,
            street_address,
            pincode,
            city,
            state,
            country,
            phone
          }]
        });
      } else {
        addressRecord.address.push({
          full_name,
          street_address,
          pincode,
          city,
          state,
          country,
          phone
        });
      }
  
      await addressRecord.save();
      res.redirect('/profile/' + req.user._id)
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding address');
    }
  }
  

  exports.loadProfile = async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const addresses = await Address.findOne({ user_id: userId }) || []; 
      console.log("jdjkkdh",addresses)
      res.render('user/profile', { user, addresses });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  };


  exports.editProfile = async (req, res) => {
    const { username, phone } = req.body;
    const userId = req.params.userId; 
    console.log(userId)
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, phone},
            { new: true} 
        );
       console.log(updatedUser)
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.redirect('/profile/' + userId);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Server error');
    }
};

exports.deleteAddress = async (req, res) => {
    const addressId = req.params.id
    const userId = req.user._id
    console.log("Deleting address for user:", userId, "and address ID:", addressId)
    try {
        let addressRecord = await Address.findOne({ user_id: userId });

        if (!addressRecord) {
            return res.status(404).json({ message: 'Address record not found.' });
        }

        const updatedAddresses = addressRecord.address.filter(add => add._id.toString() !== addressId);

        if (updatedAddresses.length === addressRecord.address.length) {
            return res.status(404).json({ message: 'Address not found.' });
        }

        if (updatedAddresses.length === 0) {
            await Address.deleteOne({ user_id: userId });
        } else {
            addressRecord.address = updatedAddresses;
            await addressRecord.save();
        }

        res.status(200).json({ message: 'Address deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting address.' });
    }
}




exports.loadAbout = async(req,res)=>{
    try{
        res.render('user/about')
    }catch(error){
        console.log(error.message)
    }
}

exports.loadContact = async(req,res)=>{
    try{
        res.render('user/contact')
    }catch(error){
        console.log(error.message)
    }
}
exports.userLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err.message);
            return res.status(500).json({ success: false, message: "Could not log out. Please try again." });
        }

        return res.redirect('/login'); 
    });
}

exports.loadCart =  async (req, res) => {
    const { userId } = req.params
    console.log(userId)
    
    try {
        console.log("hsjaguijdh")
        
        const cart = await Cart.findOne({ user_id: userId }).populate('items.product_id')
        console.log(cart)
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' })
        }
        const products = cart.items.map(item => {
            return {
                ...item.product_id._doc, 
                quantity: item.quantity,  
                price: item.price        
            }
        })
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


exports.loadCheckout = async (req, res) => {
         const userId = req.user._id
    try { 
        const cart = await Cart.findOne({ user_id: userId });
        const addresses = await Address.findOne({ user_id: userId }) || []; 
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

exports.placeOrder = async (req, res) => {
    const { address_id, payment_method } = req.body;
      console.log(address_id)
      console.log(47927982,req.body);
      
    if (!address_id || !payment_method) {
        return res.status(400).json({ message: "Address and payment method are required." });
    }

    try {
        const userCart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id');

        if (!userCart) {
            return res.status(400).json({ message: "No cart found for the user." });
        }
         console.log(userCart,"dyq")
        const newOrder = new Orders({
            order_id: generateOrderId(), 
            cart_id: userCart._id,  
            user_id: req.user._id, 
            address_id,
            payment_method,
            items: userCart.items,  
            total_amount: userCart.total_price, 
        });

        await newOrder.save()
          console.log(678994,newOrder)

          for (const item of userCart.items) {
            const product = await Product.findById(item.product_id);

            if (product) {
                const variantUpdate = product.variants[0]
                if (variantUpdate.stock >= item.quantity) {
                    variantUpdate.stock -= item.quantity
                    await product.save(); 
                } else {
                    return res.status(400).json({ message: `Insufficient stock for product: ${product.product_name}` });
                }
            } else {
                return res.status(400).json({ message: `Product not found: ${item.product_id}` });
            }
        }

          userCart.items = []
          userCart.total_price = 0
          await userCart.save()

        res.status(200).json({ message: "Order placed successfully and cart deleted!" });
    } catch (error) {
        console.error("Error placing the order:", error);
        res.status(500).json({ message: "Failed to place the order." });
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
        const addressDocument = await Address.findOne({ 'address._id': order.address_id });
   
      if (!addressDocument) {
          return res.status(404).send({ message: 'Address not found' });
      }

      const address = addressDocument.address[0]
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
          res.render('user/order-view', { order,address});
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching order details' });
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