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