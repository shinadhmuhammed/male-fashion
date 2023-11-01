const mongoose=require('mongoose')

const OrderSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
    },
  
    orderId: {
      type: Number,
      required: true,
    },
  
    address:{
      name:{
        type: String,
         required: true,
      },
      house:{
        type:String,
        required:true,
      },
      city:{
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
     delivery_point:{
        type:String,
        required:true,
     }  
    },
  
    date: {
      type: String,
      required: true,
    },
  
  
    products: [{
      productId: {
        type: String,
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      productPrice: {
        type: Number,
        required: true,
      },
      count: {
        type: Number,
        required: true,
      },
      size:{
        type: String,
        required: true
      }
    }
    ]
})

module.exports={
    Order:mongoose.model('Order',OrderSchema)
}