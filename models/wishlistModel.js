const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    ProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ProductName: {
        type: String,
        required: true,
    },
    ProductImage: {
        type: String, 
        required: true,
    },
    ProductPrice: {
        type: Number,
        required: true,
    },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
