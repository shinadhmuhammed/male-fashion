const { render } = require('ejs');
const {User} = require('../models/userModel');
const bcrypt = require('bcrypt')
const Products=require('../controlers/userController')
const {Product}=require('../models/productmodel');
const multer=require('multer')
const storage=multer.memoryStorage();
const upload=multer({storage})


const securepassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch(error){
        console.log(error.message);
    }
}
const loadAdmin = async(req,res)=>{
    try{
        res.render('admin/adminLogin')
    } catch(error){
        console.log(error.message);
    }
}


const adminValid = async(req,res)=>{
    const { email, password} = req.body;
  
    try{
        const admin = await User.findOne({email})
    
        if(!admin){
            return res.render('admin/adminLogin',{message:"admin not registerd"})
        }
        
        const isMatch = await bcrypt.compare(password,admin.password)
        if(!isMatch){
            return res.render('admin/adminLogin',{ message:"password is incorrect" })
        }
        if(admin.is_admin === 1){
            req.session.admin = admin._id
            res.redirect('/admin/dashboard');
        }else{
            res.render('admin/adminLogin',{ message:"your not a admin" })
        }
       
      
    } catch(error){
        console.log(error.message);
    }
}


const userDashboard = async (req,res)=>{  
    const { query } = req.query
    try {
        let users;
        if (query) {
            users = await User.find({ name: { $regex: '.*' + query + '.*'}, is_admin: 0 });
        } else {
            users = await User.find({ is_admin: 0 });
        }
        return res.render('admin/dashboard', { users, query });
    } catch (error) {
        res.render('admin/dashboard')
    }
}


const products = async (req, res) => {
    try {
        const products = await Product.find({});
        res.render("admin/product", { products }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while loading the products.");
    }
}




const form=async(req,res)=>{
    res.render('admin/addproduct')
}

const addProducts=async(req,res)=>{
    res.render('admin/addproduct')
}


const addProduct = async (req, res) => {
    const { productName, productPrice, productCategory, productDescription } = req.body;
    const productImage = req.file;  
    console.log(productName,productCategory)
    try {
        const newProduct = new Product({
            productName,
            productPrice,
            productCategory,
            productDescription,
            productImage,  
        });
        await newProduct.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.render('admin/addproduct', { error: "Error adding the product" });
    }
}



// const user=async(req,res)=>{
//     res.render('admin/users')
// }



const user=async(req,res)=>{
    const {query}=req.query;
    try{
        let users;
        if (query) {
            users = await User.find({
                name: { $regex: '.*' + query + '.*' },
                is_admin: 0,
            });
        } else {
            users = await User.find({ is_admin: 0 });
        }
      
        res.render('admin/users', { users, query });
    } catch (error) {
        
        console.error(error);
        res.render('admin/dashboard'); 
    }
};

const blockUser = async (req, res) => {
    try {
        const id = req.params.userId;

        
        const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            
            user.is_blocked = !user.is_blocked;
    
          
            await user.save();
    
            
            res.redirect("/admin/users");
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    const unblockUser = async (req, res) => {
        try {
            const id = req.params.userId;
    
            console.log(`Attempting to unblock user with ID: ${id}`);
    
            const user = await User.findById(id);
    
            if (!user) {
                console.log(`User with ID ${id} not found`);
                return res.status(404).json({ message: 'User not found' });
            }
    
            user.is_blocked = false;
    
            await user.save();
    
            console.log(`User with ID ${id} unblocked successfully`);
            res.redirect("/admin/users");
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    

    
// const deleteUser = async (req,res)=>{
//     try{
//         const { userId } = req.query
//         const deleteUser = await User.findByIdAndDelete(userId)


//         if(!deleteUser){
           
//             res.render('admin/dashboard',{message:"user not found"})
//         }
//         if(deleteUser){
         
//             return res.redirect('/admin/dashboard')
//         }


//     } catch(error){
//         console.log(error)
//     }
// }

// const editerload = async(req,res) =>{
//     const { id } = req.params
//     try{
//         const user = await User.findById(id)
//         res.render('admin/userEdit', { user })    

//     } catch(error){
//         console.log(error);
//     }
// }

// const updateUser = async (req,res) => {
//     const { id } = req.params
//     const { name, email, mobile, is_varified } = req.body
//     try{
//         await User.findByIdAndUpdate(id, {$set: {
//             name,
//             email,
//             mobile,
//             is_varified
//         }})

//         res.redirect('/admin/dashboard')
//     } catch(erro){
//         console.log(erro);
//     }
// }

const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/admin/login')
}



module.exports = {
    adminValid,
    loadAdmin,
    userDashboard,
    products,
    addProducts,
    addProduct,
    user,
    blockUser,
    unblockUser,
    form,
    logout
}