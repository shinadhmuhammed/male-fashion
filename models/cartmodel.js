const { ObjectId } = require('mongodb');
const mongoose=require('mongoose')

const CartSchema=new mongoose.Schema({

  UserId:{
    type: ObjectId,
    ref:'User',
    required: true
},
ProductId: {
  type : ObjectId,
  ref : 'Product',
  required : true
},

size:{
  type:String,
},

Quantity:{
  type: Number,
  required : true,
  default : 1,
  min:1
},
productPrice:{
  type:Number,
},
});

 module.exports = mongoose.model('Cart', CartSchema)
