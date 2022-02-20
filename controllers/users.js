const User = require('../models/user');
const sendEmail = require('../utils/send_email');

// form for new user
module.exports.renderRegister = (req, res, next) => {
    res.render('users/register');
}

// register new user
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        await sendEmail(undefined,undefined,`New Yelp User - ${user._id}`, "emails/newUser.ejs", {user})
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

// form for user to login
module.exports.renderLogin = (req, res, next) => {
    res.render('users/login');
}

// let user login
module.exports.login = (req, res, next) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

// logout
module.exports.logout = (req, res, next) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}