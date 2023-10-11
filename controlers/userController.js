const {User} = require('../models/userModel');
const bcrypt = require('bcrypt');
const { render } = require('ejs');
const session = require("express-session")
const generateOtp=require('otp-generator')
const nodemailer=require('nodemailer')
const {Product}=require('../models/productmodel');
const productmodel = require('../models/productmodel');




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

//user registration 
let nname
let eemail
let ppassword
let mobile


const insertUser = async (req, res) => {
    try {
        const { name, email, password, mno } = req.body;

        nname = name,
        eemail=email,
        ppassword=password,
        mobile=mno

        try {
            const spassword = await securepassword(password);

          
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.render('user/registration', { message: 'User with this email already exists.' });
            }

        
            const otp = generateOTP(); 
            await sendOtpMail(email, otp); 
            req.session.saveOtp = otp;
            console.log(otp)

           
               
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
        const savedUser = await user.save();
        res.render('user/login');
    } else {
        res.render('user/enterotp', { message: 'Invalid OTP, please try again.' });
    }
};






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

        const is_blocked = user.is_blocked;

        if (is_blocked === true) {
            res.render('user/login');
        } else {
            const isMatch =  bcrypt.compare(password, user.password);

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
        console.log('Query Criteria:', { listStatus: true, deleteStatus: false });
        const products = await Product.find();
        const productImage = products.map(product => product.productImage[0].filename);
        res.render("user/shop", { products,productImage }); 
        
        console.log('products',products,productImage)
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while loading the shop.");
    }
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
    loadlogin,
    loadindex,
    loadshop,
    userValid,
    loadHome,
    logout,
}

