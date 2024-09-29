
exports.loadLogin =async (req,res) => {
    try {
        res.render('user/login')
    } catch (error) {
        console.log(error.message)
    }
   
}

exports.loadHome = (req, res) => {
    // Render home.ejs from the views/user directory
    res.render('user/home',);
};
exports.loadRegister = (req,res)=>{
    res.render('user/register')
}
exports.registerUser = (req,res)=>{
    res.redirect('user/login')
}
exports.notFound= (req,res)=>{
    res.render('user/error_page')
}
exports.forgotPass=(req,res)=>{
    res.render('user/reset_pass')
}









