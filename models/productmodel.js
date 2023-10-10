const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    productImage: {
        type: String, 
        required: true,
    },
    productPrice: {
        type: Number,
        required: true,
    },
    productCategory: {
        type: String,
        required: true,
    },
    productDescription: {
        type: String,
        required: true,
    },
});

module.exports = {
    Product: mongoose.model('Product', productSchema),
};
