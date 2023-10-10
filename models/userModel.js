const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    mobile:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    is_admin:{
        type:Number,
        default:0
    },
    is_varified:{
        type:Number,
        default:0
    },
    otp:{
        type:String,
        default:null
    },
    is_blocked: { 
        type: Boolean,
        default: false 
    }
})


const User = mongoose.model('User', userSchema);

module.exports = {
    User
};
 