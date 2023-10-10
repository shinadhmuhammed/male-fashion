
const userRoute = require('./routes/userRoutes')
const adminroute = require('./routes/adminRoutes')
const session = require('express-session')
const path = require("path")
const otpGenerator=require('otp-generator')
const mongoose = require("mongoose")
const nocache = require('nocache')
const express = require('express')
const app = express();
const morgan=require('morgan')


const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(nocache())
// app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret:"asdfghjkloiuyyjdsh",
    resave:false,   
    saveUninitialized:true
}))



app.use(express.static(path.join(__dirname,'./admin')))
app.use(express.static(path.join(__dirname, './public')))



app.use('/',userRoute)
app.use('/admin',adminroute)



mongoose
    .connect('mongodb://127.0.0.1:27017/myuser')
    .then(() => console.log('DB Connected'))
    .catch(err => console.log(err))

app.listen(3000,()=>{
    console.log('app is running');
})




