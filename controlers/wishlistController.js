
const {Product}=require('../models/productmodel');
const Wishlist=require('../models/wishlistModel');





      
    const wishlistPage = async (req, res) => {
        try {
            const userId = req.session.user;
            if (!userId) {
                return res.redirect('/login');
            }
            const wishlistItems = await Wishlist.find({ UserId: userId }).populate('ProductId');
    
            res.render('user/wishlist', { wishlistItems });
        } catch (error) {
            console.error('An error occurred:', error);
            res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    };
    
    
    
    
        const addToWishlist = async (req, res) => {
        try {
            const userId = req.session.user;
            const productId = req.params.productId;
            const product = await Product.findById(productId);
    
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
    
            const existingWishlistItem = await Wishlist.findOne({ ProductId: productId, UserId: userId });
    
            if (existingWishlistItem) {
                res.json({ message: 'Product is already in the wishlist.' });
            } else {
                const newWishlistItem = new Wishlist({
                    ProductId: productId,
                    UserId: userId,
                    ProductName: product.productName,
                    ProductImage: product.productImage[0].filename,
                    ProductPrice: product.productPrice,
                });
    
                await newWishlistItem.save();
                res.json({ message: 'Product added to the wishlist successfully.' });
            }
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "An error occurred while processing your request." });
        }
        };
    
    
    
        const removeFromWishlist = async (req, res) => {
            try {
                const itemId = req.params.itemId;
                const deletedItem = await Wishlist.findByIdAndDelete(itemId);
        
                if (!deletedItem) {
                    return res.status(404).json({ error: 'Item not found in the wishlist' });
                }
                res.status(200).json({ message: 'Product removed from wishlist successfully' });
            } catch (error) {
                console.error("An error occurred:", error);
                res.status(500).json({ error: "An error occurred while processing your request." });
            }
        };
        
        

        module.exports={
            wishlistPage,
            addToWishlist,
            removeFromWishlist,
        }