const { render } = require('ejs');
const {User} = require('../models/userModel');
const Users=require('../controlers/userController')
const {Product}=require('../models/productmodel');
const {Category} = require('../models/categorymodel');
const {Order}=require('../models/ordermodel')
const multer=require('multer')
const storage=multer.memoryStorage();
const PDFDocument = require('pdfkit');
const upload=multer({storage})


let adminEmail="admin@gmail.com"
let adminPassword="1234"




const loadAdmin = async(req,res)=>{
    try{
        res.render('admin/adminLogin')
    } catch(error){
        console.log(error.message);
    }
}




const adminValid=async(req,res)=>{
    const {email,password}=req.body
    if(email === adminEmail && password === adminPassword){
        req.session.admin=true
        res.redirect('/admin/dashboard')
    }else{
        res.render('admin/adminLogin',{message:"you are not a admin"})
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

 ///////////////////////////////////PRODUCTS////////////////////////////////////////////////


 const products = async (req, res) => {
    try {
        const products = await Product.find({}).populate('productCategory');
        const productImages = products.map(product => product.productImage);
        console.log(products,'productImages', productImages);
        res.render("admin/product", { products, productImages });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while loading the products.");
    }
}




const form=async(req,res)=>{
    res.render('admin/addproduct')
}


const addProducts=async(req,res)=>{
    const category=await Category.find({})
    console.log('categoty sdfgdfg',category);
    res.render('admin/addproduct',{category})
}



const addProduct = async (req, res) => {
    console.log(req.body);
    // console.log(req.files);

    try {
        if(!req.files || req.files.length===0){
            return res.render('admin/addproduct',{error:'please upload atleast one image'})
        }


        const productImages = req.files.map(file => ({
            filename: file.originalname, 
            data: file.buffer, 
            contentType: file.mimetype 
        }));

        const productPrice = parseFloat(req.body.productPrice);

        if (productPrice < 0) {
            return res.render('admin/addproduct', { error: "Product price cannot be negative" });
        }
        console.log(req.body);
        const isListed = req.body.isListed === 'on'; 
        const newProduct = new Product({
            productName: req.body.productName,
            productImage: productImages,
            productPrice: productPrice,
            productDescription: req.body.productDescription,
            productCategory: req.body.productCategory,
            productStock: req.body.productStock,
            isListed: isListed, 
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
    const product = await Product.findById(productId)
    const category=await Category.find()
 console.log(category);
    if (!product) {
      res.status(404).send('Product not found');
      return;
    }
  
    res.render('admin/editproduct', { product,category });
  };




  
  
  const editProduct = async (req, res) => {
    const productId = req.params.productId;
    try {
        const product = await Product.findById(productId)

        if (!product) {
            res.status(404).send('Product not found');
            return;
        }

        product.productName = req.body.productName;
        const productPrice = parseFloat(req.body.productPrice);

        if (productPrice < 0) {
            return res.render('admin/editproduct', {
                product,
                error: "Product price cannot be negative",
            });
        }

        product.productPrice = productPrice;
        product.productDescription = req.body.productDescription;
        product.productCategory = req.body.productCategory;
        product.productStock=req.body.productStock;


        if (req.files && req.files.length > 0) {
            product.productImage = req.files.map((file) => ({
                filename: file.originalname,
                data: file.buffer,
                contentType: file.mimetype,
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



const listProduct=async(req,res)=>{
    const productId=req.params.productId
    const isListed=req.body.isListed;
    try {
        const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
        }
    
        product.isListed = isListed; 
        await product.save();
        res.status(200).json({ message: "Product listing status updated" });
      } catch (error) {
        console.error("Error toggling product listing:", error);
        res.status(500).json({ message: "Error updating product listing status" });
      }
    };


/////////////////////////////////////////////USERS/////////////////////////////////////////////////////

const user=async(req,res)=>{
    const {query}=req.query;
    try{
        let users;
        if (query) {
            users = await User.find({
                name: { $regex: '.*' + query + '.*' },
            });
        } else {
            users = await User.find({});
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
        if (user.is_blocked) {
            res.redirect("/admin/users");
        }
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


    

    ////////////////////////Category////////////////////////////////
    
    const categories = async (req, res) => {
        try {
          const categories = await Category.find({});
          res.render('admin/category', { categories: categories }); 
        } catch (error) {
          console.error(error);
          res.status(500).send("Error occurred");
        }
      }
      
    


      const categori = async (req, res) => {
        try {
            const categories = await Category.find({});
            res.render('admin/addcategory', { categories });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error occurred");
        }
    }
    





        const addcategories=async(req,res)=>{
            res.render('admin/category')
        }


        const addcategory = async (req, res) => {
            try {
                const { CategoryName } = req.body;
        
                if (!CategoryName) {
                    return res.status(400).send('Category name is required');
                }
        
                const newCategory = new Category({
                    category: CategoryName,
                });
        
                await newCategory.save();
                res.redirect('/admin/category');
            } catch (error) {
                console.error('Error adding category:', error);
                res.status(500).send('Error adding category: ' + error.message);
            }
        };
        

    
const deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId; 
    try {
      const deletedCategory = await Category.findByIdAndRemove(categoryId);
      if (deletedCategory) {
        res.status(200).send("Category deleted successfully");
      } else {
        res.status(404).send('Category not found');
      }
    } catch (error) {
      console.error('Error deleting the category', error);
      res.status(500).send("An error occurred while deleting the category");
    }
  };
  


  const editcategoryform = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            res.status(404).send('Category not found');
            return;
        }

        res.render('admin/editcategory', { category }); 
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).send('An error occurred while fetching the category');
    }
};




  const editcategory = async (req, res) => {
    const categoryId = req.params.categoryId;
  
    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { category: req.body.CategoryName }, 
        { new: true }
      );
  
      if (updatedCategory) {
       res.redirect('/admin/category')
      } else {
        res.status(404).send('Category not found');
      }
    } catch (error) {
      console.error('Error editing the category', error);
      res.status(500).send('An error occurred while editing the category');
    }
  };




//////////////////////////////////////ORDERS///////////////////////////////////////////////////////

const order=async(req,res)=>{
    try{
        const orders=await Order.find({})
        console.log(orders,'kkkkkkkkkkkkkkkkkk');
        res.render('admin/order',{orders})
    }catch(error){
        console.error(error);
        res.status(500).send('Error fetching orders')
    }
}



const orderShipping = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId);

      if (order.status === 'Shipped') {
        order.status = 'Delivered';
      } else {
        order.status = 'Shipped';
      }

      await order.save();
      
      const [orders, deliveredOrders] = await Promise.all([Order.find(), Order.find({ status: 'Delivered' })])

      res.render('admin/order', { deliveredOrders, orders, order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating the status' });
    }
};



const cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId);
      order.cancelled = true;
      await order.save();
      res.redirect('/admin/orders');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error cancelling the order' });
    }
  };




  ////////////////////////////////DASHBOARD///////////////////////////////////////////
  const getSalesData = async (req, res) => {
    try {
      const dailySalesData = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            total: { $sum: '$total' },
          },
        },
        { $sort: { '_id': 1 } },
      ]);
  
      const weeklySalesData = await Order.aggregate([
        {
          $group: {
            _id: { $week: '$date' },
            total: { $sum: '$total' },
          },
        },
        { $sort: { '_id': 1 } },
      ]);
  
      const yearlySalesData = await Order.aggregate([
        {
          $group: {
            _id: { $year: '$date' },
            total: { $sum: '$total' },
          },
        },
        { $sort: { '_id': 1 } },
      ]);
  
      const dailyLabels = dailySalesData.map(day => day._id);
      const dailySales = dailySalesData.map(day => day.total);
  
      const weeklyLabels = weeklySalesData.map(week => `Week ${week._id}`);
      const weeklySales = weeklySalesData.map(week => week.total);
  
      const yearlyLabels = yearlySalesData.map(year => `Year ${year._id}`);
      const yearlySales = yearlySalesData.map(year => year.total);
  
      res.json({ dailyLabels, dailySales, weeklyLabels, weeklySales, yearlyLabels, yearlySales });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  


  const totalUsers=async(req,res)=>{
    try {
      const totalUsers = await User.countDocuments();
      res.json({ totalUsers });
    } catch (error) {
      console.error('Error fetching total users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };





  const generateReport = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      const orders = await Order.find({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
  
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=orders-report.pdf`);
  
      doc.pipe(res);
      doc.fontSize(16).text('Orders Report', { align: 'center' });
  
      orders.forEach((order, index) => {
        doc.moveDown().fontSize(14).text(`Order ${index + 1} Details:`);
  
        doc.text(`Order ID: ${order._id}`);
        doc.text(`Date: ${order.date}`);
        doc.text(`Total: $${order.total.toFixed(2)}`);
  
        doc.moveDown().fontSize(12).text('Products:');
  
        order.products.forEach(product => {
          doc.text(`- ${product.productName}, Quantity: ${product.quantity}, Price: $${product.productPrice.toFixed(2)}`);
        });
  
        doc.moveDown().fontSize(12).text('Delivery Address:');
  
        const address = order.address[0]; 
        doc.text(`Name: ${address.name}`);
        doc.text(`Number: ${address.number}`);
        doc.text(`House: ${address.house}`);
        doc.text(`City: ${address.city}`);
        doc.text(`State: ${address.state}`);
        doc.text(`Pincode: ${address.pincode}`);
        doc.text(`Delivery Point: ${address.delivery_point}`);
  
        doc.moveDown(); // Add space between orders
      });
  
      doc.end();
    } catch (error) {
      console.error('Error generating orders report:', error);
      res.status(500).send('Internal Server Error: ' + error.message);
    }
  };



    const totalRevenue=async(req,res)=>{
      try {
        const totalRevenue = await Order.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$total' } 
            }
          }
        ]);
        
        res.json({
          totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        });
      } catch (error) {
        console.error('Error fetching total revenue:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  




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
    listProduct,
    user,
    blockUser,
    unblockUser,
    categories,
    categori,
    addcategories,
    addcategory,
    deleteCategory,
    editcategoryform,
    editcategory,
    form,
    order,
    orderShipping,
    cancelOrder,
    getSalesData,
    totalUsers,
    generateReport,
    totalRevenue,
    logout
}