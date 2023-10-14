const {User} = require('../models/userModel');
const bcrypt = require('bcrypt');
const { render } = require('ejs');
const session = require("express-session")
const generateOtp=require('otp-generator')
const nodemailer=require('nodemailer')
const {Product}=require('../models/productmodel');
const {Category}=require('../models/categorymodel')
const productmodel = require('../models/productmodel');
const mongoose=require('mongoose')




const securepassword = async(password)=>{
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    }catch(error){
        console.log(error.message)
    }
}





const loadRegister = async(req,res)=>{
    try{
      
        res.render('user/registration')

    } catch(error){
        console.log(error.message);
    }
}

/////////////////////////user registration/////////////////////////////////////
let nname
let eemail
let ppassword
let mobile




const insertUser = async (req, res) => {
    try {
        const { name, email, password, mno } = req.body;

        // Validate the 'name' field
        if (!/^[A-Za-z]+$/.test(name)) {
            return res.render('user/registration', { message: 'Name can only contain alphabetic characters.' });
        }

        // Validate the 'email' field
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.render('user/registration', { message: 'Invalid email format.' });
        }

        if (password.length < 6) {
            return res.render('user/registration', { message: 'Password must be at least 6 characters long.' });
        }

        nname = name;
        eemail = email;
        mobile = mno;
        ppassword=password
        try {
            
            const spassword = await securepassword(password);

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.render('user/registration', { message: 'User with this email already exists.' });
            }

            const otp = generateOTP();
            await sendOtpMail(email, otp);
            req.session.saveOtp = otp;
            console.log(otp);

            
            const newUser = new User({
                name: nname,
                email: eemail,
                password: spassword, 
                mobile: mobile,
            });

            await newUser.save();

            res.redirect(`/showOtp/${eemail}/${otp}`);
        } catch (error) {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
    }
};






const showOtp = async (req, res) => {
    try {
          res.render('user/enterotp');
    }catch (error) {}
};






function generateOTP() {
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}


async function sendOtpMail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "muhammedshinad2@gmail.com",
                pass: "ljzf nkim qeqn cmmb", 
            },
        });

        const mailOptions = {
            from: "muhammedshinad2@gmail.com",
            to: email, 
            subject: "OTP Verification",
            text: `Your OTP for verification is: ${otp}`, 
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully to", email);
    } catch (error) {
        console.log("Error sending OTP email:", error);
    }
}

const verifyOtp = async (req, res) => {
    const enteredOtp = req.body.otp;
    const savedOtp = req.session.saveOtp; 
    console.log(enteredOtp, savedOtp, "condition");

    if (enteredOtp === savedOtp) {
        const user = new User({
            name: nname,
            email: eemail,
            password: ppassword,
            mobile: mobile,
        });
        res.render('user/login',{message:'user signup successfully'});
    } else {
        res.render('user/enterotp', { message: 'Invalid OTP, please try again.' });
    }
};








/////////////////////////login/////////////////////////////

const loadlogin = async(req,res)=>{
    try{
        res.render('user/login')

    } catch(error){
        console.log(error.message);
    }
}

const userValid = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found in the database");
            return res.render('user/login', { message: "User not found" });
        }

        const storedPassword = user.password; 

        const is_blocked = user.is_blocked;

        if (is_blocked === true) {
            res.render('user/login');
        } else {
            const isMatch = await bcrypt.compare(password, storedPassword); 
            console.log('Password comparison result:', isMatch);

            if (!isMatch) {
                console.log("Wrong password");
                return res.render('user/login', { message: 'Wrong password' });
            }

            req.session.user = user._id;
            res.redirect('/home');
        }
    } catch (error) {
        console.log("Error in userValid:", error.message);
        res.render('user/login', { message: 'An error occurred during login' });
    }
};








//////////////////Home page/////////////////////////

const loadHome = async (req, res) => {
    try {
        const user = await User.findById(req.user)
        res.render('user/index', { user, error: null })
    } catch (error) {
        res.render('user/index', { error: 'Somthing went wrong', user: null })
    }
}

const loadindex=async(req,res)=>{
    res.render('user/index')
}



const loadshop = async (req, res) => {
    try {
        const products = await Product.find();
        const categories = await Category.find(); 
        const productImages = products.map(product => product.productImage.map(image => image.filename));
        res.render("user/shop", { products, productImages, categories }); 
        
        console.log('products', products, productImages,Category);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while loading the shop.");
    }
}

const zoom=async(req,res)=>{
    res.render('user/zoom')
}





const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/login')
}



module.exports = {
    loadRegister,
    insertUser,
    showOtp,
    verifyOtp,
    // resendOtp,
    loadlogin,
    loadindex,
    loadshop,
    zoom,
    userValid,
    loadHome,
    logout,
}

