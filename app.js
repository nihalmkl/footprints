const express = require("express")
const env = require('dotenv').config()
const path = require('path')
const session = require('express-session')
const connectDB = require('./config/db')
const passport = require('./config/passport')
const nocache = require('nocache')
const app = express()

connectDB()

app.use(passport.initialize())
app.use(passport.session())

const user_route = require('./routes/userRoute')
const admin_route = require('./routes/adminRoute')


app.use(session({
    secret: process.env.SECRET_KEY || 'secret key',
    resave:false,
    saveUninitialized:true
}))

app.use(nocache())

app.set('views',[path.join(__dirname,"views/user"),path.join(__dirname,"views/admin")])
app.set('view engine','ejs')

app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())
app.use(express.urlencoded({extended:true}))


 app.get('/',user_route)
 app.get('/admin',admin_route)

const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`server is running http://localhost:${PORT}`)
})