const {User} = require('../models/userModel');
const bcrypt = require('bcrypt');
const { render } = require('ejs');
const session = require("express-session")
const generateOtp=require('otp-generator')
const nodemailer=require('nodemailer')
const {Product}=require('../models/productmodel');
const {Category}=require('../models/categorymodel')
const {Order}=require('../models/ordermodel')
const Cart = require('../models/cartmodel')
const dotenv=require('dotenv')
dotenv.config();




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

       
        if (!/^[A-Za-z]+$/.test(name)) {
            return res.render('user/registration', { message: 'Name can only contain alphabetic characters.' });
        }

        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.render('user/registration', { message: 'Invalid email format.' });
        }

        if (password.length < 6) {
            return res.render('user/registration', { message: 'Password must be at least 6 characters long.' });
        }

        if(mno.length !== 10){
            return res.render('user/registration',{message:'mobile number is not valid'})
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
            const otpExpiration=Date.now() + 300000
            req.session.saveOtp=otp;
            req.session.otpExpiration=otpExpiration

            await sendOtpMail(email, otp);
            req.session.saveOtp = otp;
            console.log(otp);

            
            const newUser = new User({
                name: nname,
                email: eemail,
                password: spassword, 
                mobile: mobile,
            });

            // await newUser.save();

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
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
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
    const otpExpiration = req.session.otpExpiration;
    const password = ppassword; 

    if (otpExpiration && Date.now() <= otpExpiration) {
        if (enteredOtp === savedOtp) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User({
                name: nname,
                email: eemail,
                password: hashedPassword, 
                mobile: mobile,
            });

            try {
                await user.save(); 
                res.render('user/login', { message: 'User signup successfully' });
            } catch (error) {
                console.log(error.message);
                res.render('user/enterotp', { message: 'Error saving user data.' });
            }
        } else {
            res.render('user/enterotp', { message: 'Invalid OTP, please try again.' });
        }
    } else {
        res.render('user/enterotp', { message: 'OTP has expired, please request a new one.' });
    }
};






const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const newOtp = generateOTP();
        await sendOtpMail(eemail, newOtp); 
        console.log(newOtp)
        req.session.saveOtp = newOtp;
        req.session.otpExpiration = Date.now() + 300000; 

        res.json({ message: 'New OTP sent successfully',otp:newOtp });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to generate and send OTP' });
    }
};







//////////////////////////////////////Login/////////////////////////////////////////////////



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
            res.render('user/login',{message:'user is blocked'});
        } else {
            const isMatch = await bcrypt.compare(password, storedPassword); 

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
        const userId=req.session.user
        res.render("user/shop", { products, productImages, categories,userId }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while loading the shop.");
    }
}




const categorySelection = async (req, res) => {
    try {
      const categoryId = req.params.categoryId; 
        console.log(categoryId);
      
      const productsInCategory = await Product.find({ productCategory: categoryId }).exec();
  
    
      res.json(productsInCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };







const shopdetails= async (req, res) => {
    const userId=req.session.user
    const products = await Product.find({_id:req.query.id}).populate('productCategory')
    const productImages = products.map(product => product.productImage.map(image => image.filename)).flat()
    
    console.log(products,productImages)
    res.render("user/shopdetails", { products,productImages,userId}); 
  };
  




     const shoppingpage=async(req,res)=>{
         try{
           const userId=req.session.user
            const ProductId=req.session.ProductId
            //  console.log(userId,ProductId)
            if(!userId){
                return res.redirect('/login')
            }
            const cartItems=await Cart.find({UserId:userId}).populate('ProductId')

            // console.log(cartItems,'bbhonin');
            let totalSum = 0;
            cartItems.forEach((item) => {
              totalSum += item.ProductId.productPrice* item.Quantity;
            });

            res.render('user/shoppingcart',{cartItems,totalSum})
        }catch(error){
            console.error('an error occured:',error)
            res.status(500).json({error:'An error occured while processing the request'})
        }
        }



  


        const updateCart = async (req, res) => {
            try {
                let {productId, count } = req.body;
                const userId=req.session.user
                const product = await Product.find({_id:productId})
                const cartItem = await Cart.findOne({ UserId: userId, 'ProductId': productId})
                
                
                count ? cartItem.Quantity = cartItem.Quantity + 1:cartItem.Quantity = cartItem.Quantity - 1;

                if(cartItem.Quantity>=1){
                    if(cartItem.Quantity <= product[0].productStock){
                        await cartItem.save();
                    }
                }
                

                const cartItems=await Cart.find({UserId:userId}).populate('ProductId')
                let totalSum = 0;
                cartItems.forEach((item) => {
                  totalSum += item.ProductId.productPrice* item.Quantity;
                });
                    console.log(totalSum);
                res.json({ totalSum });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        };
        
        
        
        






        const shoppingcart = async (req, res) => {
        try {
           const userId = req.session.user;
         const productId = req.params.productId;
         const size = req.body.size;
        console.log(userId,productId,size);

        if (!userId) {
        res.json(false);
         } else {
        const newCart = new Cart({
          ProductId: productId,
          UserId: userId,
          size: size,
          });
        await newCart.save();
  
          res.json(true);
         }
        } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).json({ error: "An error occurred while processing your request." });
    }
  };
  

  


  
 
  





  const removeCartItem = async (req, res) => {
    const itemId = req.params.itemId;
    console.log('Item ID:', itemId);

    try {
        const deletedItem = await Cart.findByIdAndRemove(itemId);
        console.log('Deleted Item:', deletedItem);

        if (!deletedItem) {
            return res.status(404).json({ success: false, error: 'Item not found.' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error removing item:', err);
        return res.status(500).json({ success: false, error: 'An error occurred while removing the item.' });
    }
};



  



const loadcheckoutpage = async (req, res) => {
    try {
      const userId = req.session.user;
      console.log(userId, 'dijksn');
      const user = await User.findById(userId);
      const cartItems = await Cart.find({ UserId: userId }).populate('ProductId');
      let totalSum = 0;
                cartItems.forEach((item) => {
                  totalSum += item.ProductId.productPrice* item.Quantity;
                });
      req.session.address=user.Address
  
      if (!user) {
        return res.status(404).json({ message: 'user not found' });
      }
  
      const address = user.Address;
    //   console.log(address,cartItems, 'dbhjsdsfdfsdfd');
  
      res.render('user/checkout', { user, address,cartItems,totalSum });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  

  
  
    const checkout = async (req, res) => {
        try {
          const { name, number,house, city, state, pincode, delivery_point } = req.body;
      
       
          if (!name || !number|| !house || !city || !state || !pincode || !delivery_point) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
          }
      
        //   console.log(name, house, city, state, pincode, delivery_point);
      
          const userId = req.session.user;
      
          const address = {
            name,
            number,
            house,
            city,
            state,
            pincode,
            delivery_point,
          };
      
          const user = await User.findByIdAndUpdate(userId, {
            $push: { Address: address },
          });
      
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          return res.render('user/checkout', { message: 'Address added successfully',address });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
      


      const order = async (req, res) => {
        try {
          const userId = req.session.user;
          const cartItems = await Cart.find({ UserId: userId }).populate('ProductId');
          const user = await User.findById(userId); 
          const userAddress = user.Address;
          
          console.log('jjjjjj', userId, cartItems, userAddress,'kkkkkkkkkkkkk');
      
          const newOrder = new Order({
            userId: userId,
            products: cartItems,
            address: userAddress, 
          });
      
          await newOrder.save();
          res.send('Order placed successfully');
        } catch (error) {
          console.error(error);
          res.status(500).send('Error placing the order');
        }
    };
    
      
      
      
      

  


      const profileView = async (req, res) => {
        try {
            const userId = req.session.user;
    
            if (!userId) {
                return res.status(401).send('User data not found in the session.');
            }
    
            const userData = await User.findById(userId);
    
            if (!userData) {
                return res.status(404).send('User not found in the database.');
            }
    
            const address = userData.Address; 
         
    
            res.render('user/profile', { userData, address });
        } catch (error) {
            res.status(500).send(error.message);
        }
    };
    


    const editAddress = async (req, res) => {
        try {
          const userId = req.session.user
          const addressId = req.params.id;
      
        
          const user = await User.findById(userId);
      
          if (!user) {
            return res.status(404).send('User not found');
          }
      
     
          const address = user.Address.id(addressId);
      
          if (!address) {
            return res.status(404).send('Address not found');
          }
      
          res.render('user/editadress', { address });
        } catch (error) {
          res.status(500).send(error.message);
        }
      };
      
      

      const updateAddress = async (req, res) => {
        try {
          const addressId = req.params.id;
          console.log(addressId,'gyhbnjhuihjnkujn');
          const { delivery_point, name, number, house, city, state, pincode } = req.body;
      
         
          const user = await User.findById(req.session.user);
          if (!user) {
            return res.status(404).send('User not found');
          }
      
          const address = user.Address.id(addressId);
      
          if (!address) {
            return res.status(404).send('Address not found');
          }
      
          address.delivery_point = delivery_point;
          address.name = name;
          address.number = number;
          address.house = house;
          address.city = city;
          address.state = state;
          address.pincode = pincode;
      
          await user.save(); 
          res.redirect('/profile');
        } catch (error) {
          res.status(500).send(error.message);
        }
      };
      
      
    




    const deleteAddress = async (req, res) => {
        try {
            const id = req.query.id;
            console.log('id', id);

            const userId = req.session.user;
    
            const userData = await User.findByIdAndUpdate(
                { _id: userId },
                { $pull: { Address: { _id: id } } }
            );
            if (userData) {
                res.redirect('/profile');
            } else {
                res.status(404).json({ error: 'Address not found or not deleted.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while deleting the address' });
        }
    }
    
    
    
    const loadChangePassword = (req, res) => {
        const message = req.query.message; 
        res.render('user/changepassword',{message});
    };




        const changepassword=async(req,res)=>{
            try{
                const userId=req.session.user;
                const {currentPassword,newPassword,confirmPassword}=req.body;
                console.log(currentPassword,newPassword,confirmPassword,'kkkkkkkkkkkkkkkkkkkkk');
                if(newPassword !== confirmPassword){
                    return res.render('user/changepassword',{message:'new password and confirmation password do not match'})
                }
                const user=await User.findById(userId)

                if(!user){
                    return res.status(400).send('user not found in the database')
                }
                
             const isMatch = await bcrypt.compare(currentPassword, user.password);

                if (!isMatch) {
            return res.render('user/changepassword', { message: 'Current password is incorrect' });
                }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.render('user/changepassword',{message:'password change successfully'});
    } catch (error) {
        res.status(500).send(error.message);
    }
};
        







const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/login')
}



module.exports = {
    loadRegister,
    insertUser,
    showOtp,
    verifyOtp,
    resendOtp,
    loadlogin,
    loadindex,
    loadshop,
    shopdetails,
    shoppingpage,
    shoppingcart,
    updateCart,
    removeCartItem,
    loadcheckoutpage,
    checkout,
    profileView,
    editAddress,
    updateAddress,
    deleteAddress,
    changepassword,
    loadChangePassword,
    userValid,
    loadHome,
    order,
    categorySelection,
    logout,
}

