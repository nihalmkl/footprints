const nocache = require('nocache')
const User = require('../../models/userSchema')
const Otp = require('../../models/otpSchema')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const env  = require('dotenv').config()
const Product = require('../../models/productSchema')
const crypto = require('crypto') 
const Address = require('../../models/addressSchema')



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

