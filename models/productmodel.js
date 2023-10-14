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

