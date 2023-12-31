const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productImage: [{
        filename: String,
        data: Buffer,
        contentType: String,
    }],
    productPrice: {
        type: Number,
        required: true,
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true,
    },
    productStock:{
        type:Number,
        required:true
    },
    productDescription: {
        type: String,
        required: true,
    },
    isListed: {
        type: Boolean,
        default: true, 
    },
    productRating: {
        type: Number,
        default: 0,
    },
});

module.exports = {
    Product: mongoose.model('Product', productSchema),
};

