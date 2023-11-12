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
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;



var instance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});






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
    const { name, email, password, mno } = req.body;

    nname = name;
    eemail = email;
    mobile = mno;
    ppassword = password;
    try {
        const spassword = await securepassword(password);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user/registration', { message: 'User with this email already exists.' });
        }

        const otp = generateOTP();
        const otpExpiration = Date.now() + 300000;
        req.session.saveOtp = otp;
        req.session.otpExpiration = otpExpiration;

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








/////////////////////////////////////////////HOME PAGE/////////////////////////////////////////

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
        const products = await Product.find({ isListed: true });

        const categories = await Category.find();
        const productImages = products.map(product => product.productImage.map(image => image.filename));
        const userId = req.session.user;

        res.render("user/shop", { products, productImages, categories, userId });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while loading the shop.");
    }
}




const categorySelection = async (req, res) => {
    try {
      const categoryName = req.params.categoryName;
  
      const category = await Category.findOne({ category: categoryName }).exec();
  
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      const products = await Product.find({ productCategory: category._id }).exec();
  
      const categoryDetails = {
        category: category,
        products: products,
      };
  
      return res.json(categoryDetails);
    } catch (err) {
      console.error('Error fetching category details:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  
  const sortProducts = async (req, res) => {
    try {
        const option = req.params.option;
        let sortedProducts;

        if (option === 'lowToHigh') {
            sortedProducts = await Product.find().sort({ productPrice: 1 }).lean();
        } else if (option === 'highToLow') {
            sortedProducts = await Product.find().sort({ productPrice: -1 }).lean();
        } else {
            return res.status(400).json({ error: 'Invalid sorting option' });
        }

        res.json(sortedProducts);
        console.log(sortedProducts,'kkkkkkkkkkkkk');
    } catch (error) {
        console.error('Error sorting the products', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};







const shopdetails= async (req, res) => {
    const userId=req.session.user
    const products = await Product.find({_id:req.query.id}).populate('productCategory')
    const productImages = products.map(product => product.productImage.map(image => image.filename)).flat()
    
    console.log(products,productImages)
    res.render("user/shopdetails", { products,productImages,userId}); 
  };
  


///////////////////////////////cart////////////////////////////////////////////////////

     const shoppingpage=async(req,res)=>{
         try{
           const userId=req.session.user
            const ProductId=req.session.ProductId
            //  console.log(userId,ProductId)
            if(!userId){
                return res.redirect('/login')
            }
            const cartItems=await Cart.find({UserId:userId}).populate('ProductId')

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
                const { productId, count } = req.body;
                const userId = req.session.user;
                const product = await Product.find({ _id: productId });
                const cartItem = await Cart.findOne({ UserId: userId, ProductId: productId });
        
                if (count > 0) {
                    if (cartItem.Quantity < product[0].productStock) {
                        cartItem.Quantity += 1;
                    }
                } else {
                    if (cartItem.Quantity > 1) {
                        cartItem.Quantity -= 1;
                    }
                }
        
                await cartItem.save();
        
                const cartItems = await Cart.find({ UserId: userId }).populate('ProductId');
                let totalSum = 0;
                cartItems.forEach((item) => {
                    totalSum += item.ProductId.productPrice * item.Quantity;
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
                const existingCartItem = await Cart.findOne({ ProductId: productId, UserId: userId, size: size });
        
                if (existingCartItem) {
                    res.json({ message: 'Product is already in the cart.' });
                } else {
                    const newCart = new Cart({
                        ProductId: productId,
                        UserId: userId,
                        size: size,
                    });
                    await newCart.save();
                    res.json({ message: 'Product added to the cart successfully.' });
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



  
//////////////////////////////////////checkout///////////////////////////////////////////////////


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
        const { name, number, house, city, state, pincode, delivery_point } = req.body;
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

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.Address) {
            user.Address = [];
        }

        const cartItems = await Cart.find({ UserId: userId }).populate('ProductId');
        user.Address.push(address);

        const updatedUser = await user.save();

        let totalSum = 0;
        cartItems.forEach((item) => {
            totalSum += item.ProductId.productPrice * item.Quantity;
        });

        return res.render('user/checkout', { message: 'Address added successfully', address: updatedUser.Address, cartItems, totalSum });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


      
const calculateTotalAmount = (cartItems) => {
    let totalSum = 0;
    cartItems.forEach((item) => {
        totalSum += item.ProductId.productPrice * item.Quantity;
    });
    return totalSum;
};

        const order = async (req, res) => {
          try {
        const userId = req.session.user;
        const cartItems = await Cart.find({ UserId: userId }).populate('ProductId').lean();
        const selectedAddressId = req.body.selectedAddressId; 
        const user = await User.findById(userId);
        
        const selectedAddress = user.Address.find(addr => addr._id.toString() === selectedAddressId);
        
        if (!selectedAddress) {
            return res.status(400).send('Selected address not found.');
        }
        
        const products = cartItems.map((cartItem) => ({
            productId: cartItem.ProductId._id,
            productName: cartItem.ProductId.productName,
            productPrice: cartItem.ProductId.productPrice,
            quantity: cartItem.Quantity,
        }));

        const totalSum = calculateTotalAmount(cartItems);

        const newOrder = new Order({
            userId: userId,
            products: products,
            address: selectedAddress, 
            total: totalSum,
            paymentMethod: req.body.paymentMethod,
        });

        await newOrder.save();
        res.status(200).send('Order placed successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error placing the order');
    }
};
    
      
      
      const getOrder = async (req, res) => {
        const userId = req.session.user;
        try {
          const orders = await Order.find({ userId: userId }).lean(); 
          res.render('user/myorder', { orders });
        } catch (error) {
          console.error(error);
          res.status(500).send('Error fetching orders');
        }
      };
      


      const cancelOrder = async (req, res) => {
        const orderId = req.params.orderId;
        console.log(orderId, 'jkkkkkkkkkkkkkkkkkkkkkkkkkk');
        try {
          const order = await Order.findById(orderId);
          console.log('Found order:', order);
      
          if (order) {
            order.cancelled = true;
            order.cancellation = new Date(); 
            console.log('Updated order:', order);
      
            await order.save();
            console.log('Order saved successfully');
            res.status(200).send('Order cancelled successfully');
          } else {
            res.status(404).send('Order not found');
          }
        } catch (error) {
          console.error(error);
          res.status(500).send('Error cancelling the order');
        }
      };
      
      
      
      
      

  ////////////////////////////////////userProfile////////////////////////////////////////////////////


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
        


            const razorPay = async (req, res) => {
                try {
                    const selectedAddressId = req.body.selectedAddressId;
                    const paymentMethod = req.body.paymentMethod;
            
                    if (!selectedAddressId || !paymentMethod) {
                        throw new Error('Invalid data received for Razorpay payment');
                    }
            
                    const userId = req.session.user;
                    const cartItems = await Cart.find({ UserId: userId }).populate('ProductId').lean();
                    const totalAmount = calculateTotalAmount(cartItems);
            
                    const orderData = {
                        amount: totalAmount * 100, 
                        currency: "INR",
                        receipt: req.body.orderId,
                        notes: {
                            key1: "value3",
                            key2: "value2"
                        }
                    };
            
                    const razorpayOrder = await instance.orders.create(orderData);
                    res.json({ orderId: razorpayOrder.id, razorpayOrder, amount: totalAmount });
                } catch (error) {
                    console.error('Error in razorPay function:', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            };
            

            
            const totalAmount = async (req, res) => {
                try {
                    const selectedAddressId = req.body.selectedAddressId;
            
                    const user = await User.findById(req.session.user);
                    const selectedAddress = user.Address.find(addr => addr._id.toString() === selectedAddressId);
            
                    if (!selectedAddress) {
                        return res.status(400).json({ error: 'Selected address not found.' });
                    }
            
                    const cartItems = await Cart.find({ UserId: req.session.user }).populate('ProductId');
                    let totalAmount = 0;
            
                    for (const cartItem of cartItems) {
                        totalAmount += cartItem.ProductId.productPrice * cartItem.Quantity;
                    }
                    res.json({ totalAmount });
                } catch (error) {
                    console.error('Error in totalAmount function:', error);
                    res.status(500).json({ error: 'Internal server error' });
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
    cancelOrder,
    getOrder,
    categorySelection,
    sortProducts,
    razorPay,
    totalAmount,
    logout,
}

