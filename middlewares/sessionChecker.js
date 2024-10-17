const User = require('../models/userSchema');

const sessionLogin = async (req, res, next) => {
    if (req.session && req.session.user) {
        try {
            const user = await User.findById(req.session.user.id);
            if (user) {
                res.locals.user = user; 
            }
        } catch (error) {
            console.error("Error fetching user from session:", error.message);
        }
    } else {
        res.locals.user = null; 
    }
    next();
};
const sessionChecker = async (req, res, next) => {
    if (req.session && req.session.user && req.session.user.id) {
        try {
            let user = res.locals.user || await User.findById(req.session.user.id);

            if (user) {
                req.user = user; 
                res.locals.user = user; 
                return next();  
            } else {
                req.session.destroy(); 
                res.locals.user = null;
                return res.redirect('/login'); 
            }
        } catch (error) {
            console.error("Error fetching user from session:", error.message);
            res.locals.user = null;
            return res.status(500).send('Server Error');
        }
    } else {
        res.locals.user = null;  
        return res.redirect('/login');      
    }
};



module.exports = {sessionChecker,sessionLogin}
