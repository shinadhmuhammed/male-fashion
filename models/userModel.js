const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        validate:{
            validator:function(value){
                return value.length >=6;
            },
            message:"password must be at least 6 characters long",
        },
    },
    is_admin: {
        type: Number,
        default: 0,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    is_blocked: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpTimestamp: {
        type: Date,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = {
    User,
};
