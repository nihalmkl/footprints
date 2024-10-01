// exports.isLogin = async (req,res,next)=>{

//     try {
        
//         if(req.session.admin_id){

//             next();
//         }else{
//             res.redirect('/admin/login')
//         }
        
//     } catch (error) {
        
//         console.log(error.message);

//     }
// }
// exports.isLogout = async (req, res, next) => {
//     try {
//         if (req.session.admin_id) {
            
//             res.redirect('/admin/dashboard');
//         } else {
//             next();
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// };
const User = require('../models/userSchema')

exports.adminAuth = async (req,res,next)=>{
    User.findOne({isAdmin:true})
    .then(data=>{
        if(data){
            next();
        }else{
            res.redirect('/admin/login')
        }
    })
    .catch(err =>
         console.log("error in admin auth middlware"))
         res.status(500).render('user/error', {
            message: 'Please try again later.',
            errorCode: 500
        })
}
