const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
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
    default: () => new Date().setHours(0, 0, 0, 0), 
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
status: {
  type: String,
  enum: ['Pending', 'Shipped', 'Delivered'], 
  required: true,
  default: 'Pending',
},
returnExpiry: {
  type: Date,
},
});

module.exports = {
  Order: mongoose.model('Order', OrderSchema),
};
