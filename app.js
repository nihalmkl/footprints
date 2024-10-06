const express = require("express");
const nocache = require('nocache');
const session = require('express-session');
const connectDB = require('./config/db');
const expressLayouts = require('express-ejs-layouts');
const env = require('dotenv').config();
const multer = require('multer')
const path = require('path');
const passport = require('./config/passport');
const app = express();
const user_route = require('./routes/userRoute');
const admin_route = require('./routes/adminRoute');

connectDB();

app.use(nocache());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: process.env.SECRET_KEY || 'secret key',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));  

app.use(passport.session());
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('layout','layout/admin')
app.set('views', path.join(__dirname, 'views'));
app.use('/public',express.static(path.join(__dirname, 'public')));

app.use('/', user_route);
app.use(expressLayouts);
app.use('/admin', admin_route);

module.exports = app;