const nocache = require('nocache')
const User = require('../../models/userSchema')
const Otp = require('../../models/otpSchema')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const env  = require('dotenv').config()

exports.loadLogin =async (req,res) => {
    try {
        res.render('user/login')
    } catch (error) {
        console.log(error.message)
    }
   
}
// exports.notFound= async(req,res)=>{
//     try{
//         res.render('user/error_page')
//     }catch(error){
//         console.log(error.message)
//     }
    
// }
exports.loadHome = async (req, res) => {
   try{
    return res.render('user/home')
   }catch(error){
    console.error("Error loading home page:", error.message);
    res.status(500).render('user/error', {
        message: 'Please try again later.',
        errorCode: 500
    });
  }
};

exports.loadLogin = (req,res)=>{
    res.render('user/login')
}
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
// exports.register = async(req,res)=>{
//     const {username,email,phone,password} = req.body
//       try {
//         const newUser = new User({
//             username,
//             email,
//             phone,
//             password
//         })
//            await newUser.save()
//            return res.redirect('user/login') 
//       } catch (error) {
//         console.log('error:',error.message)
//         res.status(500).render('user/error', {
//             message: 'Please try again later.',
//             errorCode: 500
//         });
//       }
// }
   function generateOtp(){
    return Math.floor(100000 + Math.random() * 900000)
   }
   async function sentVerificationEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: false, // true for 465, false for other ports
            requireTLS: true,
            host: "smtp.gmail.com",
            port: 587,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const info = await transporter.sendMail({ // Corrected method name here
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP is ${otp}</b>`,
        });
        console.log("Email sent: ", info);
        return info.accepted.length > 0; // Accept email return true
    } catch (error) {
        console.error("Sending email failed", error);
        return false; // Return false in case of error
    }
} 
exports.register = async (req, res) => {
    try {
        console.log(req.body);

        const { username,email,phone, password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.render("user/register", { message: "Password doesn't match" });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("user/register", { message: "User already exists" });
        }

        // Generate OTP
        const otp = generateOtp();
        console.log('Generated OTP:', otp);

        // Send OTP to the user
        const sentEmail = await sentVerificationEmail(email, otp);
        console.log('1')
        if (!sentEmail) {
            console.error("Email not sent");
            return res.json("Email not sent");
        }
           
        const recordOtp = new Otp({ email, otp });
        await recordOtp.save();
        req.session.userData = {username,email,phone,password}
        console.log('OTP sent:', otp);
        res.render('user/verify_otp'); 
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).render('user/error', {
            message: 'Please try again later.',
            errorCode: 500
        });
    }
};





exports.resendOtp = async (req, res) => {
    try{

        generateOtp()

    }catch(error){
        console.log(error.message)
    }
}



exports.loadShop = async(req,res)=>{
    try{
        res.render('user/shop')
    }catch(error){
        console.log(error.message)
    }
}


exports.productView = async(req,res)=>{
    try{
        res.render('user/product_detail')
    }catch(error){
        console.log(error.message)
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