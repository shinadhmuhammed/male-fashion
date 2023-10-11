const { render } = require('ejs');
const {User} = require('../models/userModel');
const bcrypt = require('bcrypt')
const Users=require('../controlers/userController')
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

 /////////////////products////////////////////////


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
    console.log(req.body);
    console.log(req.files);

    try {
        const productImages = req.files.map(file => ({
            filename: file.originalname, 
            data: file.buffer, 
            contentType: file.mimetype 
        }));

        const newProduct = new Product({
            productName: req.body.productName,
            productImage: productImages, 
            productPrice: req.body.productPrice,
            productDescription: req.body.productDescription,
            productCategory: req.body.productCategory,
        });

        const savedProduct = await newProduct.save();
        if (savedProduct) {
            console.log('Product saved successfully:', savedProduct);
            res.redirect('/admin/products');
        } else {
            console.error('Failed to save product.');
            res.render('admin/addproduct', { error: "Error adding the product" });
        }
    } catch (error) {
        console.error('Error adding product:', error);
        res.render('admin/addproduct', { error: "Error adding the product" });
    }
}



const deleteProduct = async (req, res) => {
    const productId = req.params.productId;
  
    try {
      const deletedProduct = await Product.findByIdAndRemove(productId);
  
      if (deletedProduct) {
        res.status(200).send("Product deleted successfully");
      } else {
        res.status(404).send("Product not found");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).send("An error occurred while deleting the product");
    }
  };
  


  
  const editProductForm = async (req, res) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
  
    if (!product) {
      res.status(404).send('Product not found');
      return;
    }
  
    res.render('admin/editproduct', { product });
  };




  
  
  const editProduct = async (req, res) => {
    const productId = req.params.productId;
    try {
        const product = await Product.findById(productId);

        if (!product) {
            res.status(404).send('Product not found');
            return;
        }

        product.productName = req.body.productName;
        product.productPrice = req.body.productPrice;
        product.productDescription = req.body.productDescription;
        product.productCategory = req.body.productCategory;

        if (req.files && req.files.length > 0) {
            product.productImage = req.files.map(file => ({
                filename: file.originalname,
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        const updatedProduct = await product.save();

        if (updatedProduct) {
            res.redirect('/admin/products');
        } else {
            res.render('admin/editproduct', { product, error: "Error updating the product" });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.render('admin/editproduct', { productId, error: "Error updating the product" });
    }
};



////////////////USERS///////////////////////////

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
    deleteProduct,
    editProductForm,
    editProduct,
    user,
    blockUser,
    unblockUser,
    form,
    logout
}