const User = require('../models/userSchema');

const sessionChecker = async (req, res, next) => {
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

module.exports = sessionChecker;
