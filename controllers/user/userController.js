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

exports.userLogin = async(req,res)=>{
    try{
        const {email,password} = req.body
        const userData = await User.findOne({email:email})
        console.log(userData)

     if(!userData){
        console.log("hii user");
        res.json({success:false,message:"User doesn't find Enter valid email"})
      return  
     }
     const isMatch = await bcrypt.compare(userData.password,password);
     if(!isMatch){
        console.log('hello')
        res.json({success:false,message:"Password does't match"})
        return 
     }
     console.log('hey')
     return res.json({success:true})
     
    }catch(error){
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
exports.loadUserHome = async(req,res)=>{
    try{
        res.render('user/user_home')
    }catch(error){
        console.log(error.message)
    }
}



exports. verifyOtp = (req,res)=>{
    res.render('user/verify_otp'); 
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
        const { username,email,phone, password, confirm_password } = req.body;
        console.log(req.body)
        if (password !== confirm_password) {
            return res.render("user/register", { message: "Password doesn't match" });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render("user/register", { message: "User already exists" });
        }

        // Generate OTP
        const otp = generateOtp();
        req.session.userOtp = otp
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

function generateNumericReferralCode(length = 6) {
    const numbers = '0123456789';
    let referralCode = '';
    for (let i = 0; i < length; i++) {
        referralCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return referralCode;
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
        const referralCode = generateNumericReferralCode(); // Generates a 6-digit numeric referral code

        if(String(otpInput) === String(otpRecord.otp)){
            console.log("checking 1")
            const user = req.session.userData
            const passwordHash = await securePassword(user.password)
            const newUser = new User({
                username:user.username,
                email:user.email,
                phone:user.phone,
                password:passwordHash,
                googleId:referralCode
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




// exports.resendOtp = async (req, res) => {
//     try {
//         const {email} = req.session.userData; // Assuming user data is stored in the session

//         if (!email) {
//             return res.status(400).json({ success: false, message: 'User session expired or not logged in.' });
//         }
//          const otp = generateOtp()
//         req.session.userotp = otp
//         const sentEmail = await sentVerificationEmail(email, otp);
//         if (sentEmail) {
//             console.error("Resend otp :",otp);
//             return res.status(200).json("Otp Send sussussfully");
//         }else{
//             res.status(500).json({success:false,message:'Internal Server Error'})
//         }
//         const recordOtp = new Otp({ email, otp });
//         await recordOtp.save();
//         console.log('OTP sent:', otp);
//     } catch (error) {
//         console.error('Error in resending OTP:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error.' });
//     }
// };

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.session.userData; // Assuming session holds user email

        if (!email) {
            return res.status(400).json({ success: false, message: 'User session expired or not logged in.' });
        }

        // Generate a new OTP
        const otp = generateOtp(); 
        req.session.userotp = otp; 

        await Otp.findOneAndDelete({ email });
        const resentotp = new Otp({
            email,
            otp,
        })

        await resentotp.save();
        console.log('New OTP saved:', otp);

        // Send the OTP to the user's email
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



exports.loadUserInterface = async(req,res)=>{
    try{
        res.render('user/user_interface')
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