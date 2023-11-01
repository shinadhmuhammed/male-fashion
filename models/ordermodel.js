const mongoose=require('mongoose')

const OrderSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
    },
  
    Address: [
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
  
  

})

module.exports={
    Order:mongoose.model('Order',OrderSchema)
}