const User = require('../models/userSchema');

exports.userAuth = (req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data && !data.isBlocked){
                next();
            }else{
                res.redirect('/login')
            }
        })
        .catch(err =>
             console.log("error in user auth middlware"))
             res.status(500).render('user/error', {
                message: 'Please try again later.',
                errorCode: 500
            })
        }else{
            res.redirect('/login')
        }      
}