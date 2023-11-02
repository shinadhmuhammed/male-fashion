const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      productName:{
        type:String,
        required:true,
      },
      
      productPrice:{
        type:Number,
        required:true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
    },
  
  ],
  address: [
    {
      name: { type: String, required: true },
      number: { type: String, required: true },
      house: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      delivery_point: { type: String, required: true },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
},
paymentMethod: {  
  type: String,
  required: true,
},
total: {
  type: Number,
  required: true,
},
cancelled: {
  type: Boolean,
  default: false,
},
});

module.exports = {
  Order: mongoose.model('Order', OrderSchema),
};
