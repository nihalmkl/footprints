
// const User = require('../models/userSchema')

// exports.adminAuth = async (req,res,next)=>{
//     User.findOne({isAdmin:true})
//     .then(data=>{
//         if(data){
//             next();
//         }else{
//             res.redirect('/admin/login')
//         }
//     })
//     .catch(err =>
//          console.log("error in admin auth middlware"))
//          res.status(500).render('user/error', {
//             message: 'Please try again later.',
//             errorCode: 500
//         })
// }
