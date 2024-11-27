const nocache = require('nocache')
const User = require('../../models/userSchema')
const Otp = require('../../models/otpSchema')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const crypto = require('crypto') 
const Address = require('../../models/addressSchema')
const mongoose = require('mongoose')
const Wishlist = require('../../models/wishlistSchema')
const Cart = require('../../models/cartSchema')
const Category = require('../../models/categorySchema')
const Razorpay = require('razorpay')
const Wallet = require('../../models/walletSchema')
const Brand = require('../../models/brandSchema')


exports.loadLogin =async (req,res) => {
    try {
        res.render('user/login')
    } catch (error) {
        console.log(error.message)
    }
   
}
    // <------------------------ this is for user login ---------------------------->
exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });

        if (!userData) {
            return res.json({ success: false, message: "User doesn't exist. Enter a valid email." });
        }

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Password doesn't match." });
        }
        req.session.user = {
            id: userData._id,
            email: userData.email,
        };

        return res.json({ success: true });
        
    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
// <------------------------ Load The UserInterinterface ---------------------------->
exports.loadHome = async (req, res) => {
    try {
      
      let cartCount = []
      let wishlistCount = []
            // for cart count show in cart icon
      if (req.session.user) {
        cartCount = await Cart.aggregate([
          { $match: { user_id: new mongoose.Types.ObjectId(req.session.user.id) } }, 
          { $project: { itemCount: { $size: "$items" } } }
        ])
               // for wishlist count show in wishlist icon
        wishlistCount = await Wishlist.aggregate([
          { $match: { user_id: new mongoose.Types.ObjectId(req.session.user.id) } },
          { $project: { itemCount: { $size: "$products" } } }
        ])
      }

      const products = await Product.find({ is_delete: false }).populate({
        path: 'category_id',
        populate: { path: 'offer' }
        })
        .populate('offer')
        
      const finalWishlistCount = wishlistCount.length > 0 ? wishlistCount[0].itemCount : 0
      const finalCartCount = cartCount.length > 0 ? cartCount[0].itemCount : 0

      products.forEach(product => {
        const productDiscount = product.offer?.discount_percentage || 0;
        const categoryDiscount = product.category_id?.offer?.discount_percentage || 0;

        const finalDiscount = Math.max(productDiscount, categoryDiscount);

        product.variants.forEach(variant => {
            variant.discounted_price = variant.price - (variant.price * finalDiscount / 100);
        });

        product.applied_discount_percentage = finalDiscount;
    });
      return res.render('user/home.ejs', {
        products,
        wishlistCount: finalWishlistCount,
        cartCount: finalCartCount
      })
      
    } catch (error) {
      console.error("Error loading home page:", error.message)
      return res.status(500).render('user/error', {
        message: 'Please try again later.',
        errorCode: 500
      })
    }
  }
  
exports.loadRegister = async(req,res)=>{
    try {
        res.render('user/register')   
    } catch (error) {
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
        return info.accepted.length > 0; 
    } catch (error) {
        console.error("Sending email failed", error);
        return false; 
    }
} 

exports.register = async (req, res) => {
    try {
        const { username,email,phone, password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.render("user/register", { message: "Password doesn't match" });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("user/register", { message: "User already exists" });
        }

        const otp = generateOtp();
        req.session.userOtp = otp

        const sentEmail = await sentVerificationEmail(email, otp);
        if (!sentEmail) {
            console.error("Email not sent");
            return res.json("Email not sent");
        }

        const recordOtp = new Otp({ email, otp });
        await recordOtp.save();
        req.session.userData = {username,email,phone,password}
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
       
        const {otpInput} = req.body
        const otpRecord = await Otp.findOne({email:req.session.userData.email})
       
       
        if(!otpRecord){
            return res.status(400).json({success:false,message:'OTP not found'})
        }

        if(String(otpInput) === String(otpRecord.otp)){
            const user = req.session.userData
            const passwordHash = await securePassword(user.password)
            const newUser = new User({
                username:user.username,
                email:user.email,
                phone:user.phone,
                password:passwordHash,
            })
            await newUser.save()
            req.session.user =  newUser._id
            res.json({success:true,redirectUrl:'/login'})
        }else{
            res.status(400).json({success:false,message:'Invalid OTP,please try again'})
        }
    }catch(error){
        res.status(500).json({ message: "Internal Server Error" });
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


// <------------------------ Load Shop Page---------------------------->
exports.loadShop = async (req, res) => {
    try {
    const { sorting, search ,category,brand} = req.query
    let sortOption = {}
    let filter = { is_delete: false }
     // this for filter category
    if (category) {
        const categories = await Category.findOne({ category_name:category})
        if(categories){
            filter.category_id = categories._id
        }
    }
     // this for search products
    if (search) {
        filter.product_name = { $regex: search, $options: 'i' }
    }
     // this for filter brand
    if (brand) {
        const brands = await Brand.findOne({ brand_name: brand });
        if (brands) {
            filter.brand_id = brands._id;
        }
    }
   
        let cartCount = []
        let wishlistCount = []
       // for wishlist count show in cart icon
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
        // this for sorting products
        switch (sorting) {
            case 'priceLowToHigh':
                sortOption = { 'variants.price': 1 }
                break
            case 'priceHighToLow':
                sortOption = { 'variants.price': -1 }
                break
            case 'newArrivals':
                sortOption = { createdAt: -1 }
                break
            case 'aToZ':
                sortOption = { product_name: 1 }
                break
            case 'zToA':
                sortOption = { product_name: -1 }
                break
            default:
                sortOption = {}
        }


        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;
    
        const totalProducts = await Product.countDocuments(filter);
        const totalPage = Math.ceil(totalProducts / limit);
       
       

        const products = await Product.find(filter).sort(sortOption).skip(skip)
        .limit(limit).populate({
            path: 'category_id',
            populate: { path: 'offer' }
        })
        .populate('offer');

        //for appliying offer in the product
        products.forEach(product => {
            const productDiscount = product.offer?.discount_percentage || 0;
            const categoryDiscount = product.category_id?.offer?.discount_percentage || 0;
            const finalDiscount = Math.max(productDiscount, categoryDiscount);
    
            product.variants.forEach(variant => {
                variant.discounted_price = variant.price - (variant.price * finalDiscount / 100);
            });
    
         product.applied_discount_percentage = finalDiscount;
        });
    
        const allCategories = await Category.find({is_delete:false})
        const allBrands = await Brand.find({is_delete:false})

        res.render('user/shop', {
            products,
            wishlistCount: finalWishlistCount,
            cartCount: finalCartCount,
            search,
            sorting,
            brand,
            category,
            allCategories,
            allBrands,
            totalPage,
            currentPage: page,
            selectedCategory:category,
            selectedBrand:brand,
        })

    } catch (error) {
        console.log(error.message)
        if (req.xhr) {
            return res.status(500).json({ message: 'Internal Server Error' })
        }
        res.status(500).send("Internal Server Error")
    }
}


exports.forgotPage = async (req,res)=>{
    try{
        res.render('user/forgot-pass')
    }catch(err){
        console.log(err);
        
    }
}
// <------------------------ This is the Forgot Password ---------------------------->
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
// <------------------------ This is for reset password---------------------------->
exports.resetPassword = async (req, res) => {

    
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

// <------------------------ Load The Product View Page---------------------------->
exports.productView = async (req, res) => {
    try {
        //This is for show cart count and wishlist count 
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
        
        // This is for take more given offer in category and product
        const product = await Product.findById(req.params.id).populate([
            { path: 'brand_id' },
            { 
                path: 'category_id', 
                populate: { path: 'offer' } 
            },
            { path: 'offer' }
        ]).lean()
        const productDiscount = product.offer?.discount_percentage || 0
        const categoryDiscount = product.category_id?.offer?.discount_percentage || 0
        const finalDiscount = Math.max(productDiscount, categoryDiscount)



        product.variants.forEach(variant => {
         variant.discounted_price = variant.price - (variant.price * finalDiscount / 100)
       })
        product.applied_discount_percentage = finalDiscount
        
        const relatedProducts = await Product.find({
            category_id: product.category_id,
            _id: { $ne: product._id } 
        }).limit(4);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('user/product_detail.ejs', { product ,relatedProducts,wishlistCount: finalWishlistCount,
            cartCount: finalCartCount});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

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
    req.session.user = null;
    return res.redirect('/')
}

const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_KEY_ID,
    key_secret: process.env.RAZOR_PAY_KEY_SECRET,
  })

// <------------------------ Load Wallet ---------------------------->
 exports.loadWallet = async (req, res) => {
    try {
  
      const wallet = await Wallet.findOne({ user: req.user._id })
      if (wallet && wallet.wallet_history) {
        wallet.wallet_history.sort((a, b) => b.date - a.date)
      }
      if (!wallet) {
        return res.render('user/wallet', { wallet: null })
      }
      res.render('user/wallet', { wallet })
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      res.status(500).send('Internal Server Error')
    }
  }

// <------------------------ Add Fund Into Wallet ---------------------------->
exports.addFund = async (req, res) => {
    const { amount } = req.body
    const paymentAmount = amount * 100 
    try {
        
      const order = await razorpay.orders.create({
        amount: paymentAmount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      })
  
      res.json({ success: true, order })
    } catch (error) {
      console.error("Error creating Razorpay order:", error)
      res.status(500).json({ success: false, message: "Failed to create order" })
    }
  }


// <------------------------ Add Fund Into Wallet Success ---------------------------->
  exports.addFundSuccess = async (req, res) => {
    const { amount } = req.body
    try {
      let wallet = await Wallet.findOne({ user: req.session.user.id })
      if (!wallet) {
        wallet = new Wallet({
          user: req.session.user.id,
          balance: amount,
          wallet_history: [
            {
              amount: amount,
              transaction_type: 'credited',
              date: Date.now(),
            },
          ],
        })
      } else {
        wallet.balance += amount
        wallet.wallet_history.push({
          amount: amount,
          transaction_type: 'credited',
          date: Date.now(),
        })
      }
  
      await wallet.save()
  
      res.json({ success: true })
    } catch (error) {
      console.error("Failed to add funds:", error)
      res.status(500).json({ success: false, message: "Failed to add funds" })
    }
  }


  exports.blockedUser = async (req,res)=>{
    try{
        console.log('is bloce')
        res.render('user/blockuser',{title:'admin blocked'})

    }catch(err){
        console.log(err)
    }
  }