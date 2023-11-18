const mongoose=require('mongoose')

const BannerSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bannerImage: {
      filename: String,
      data: Buffer,
      contentType: String,
    },
  });
  module.exports = mongoose.model('Banner', BannerSchema);