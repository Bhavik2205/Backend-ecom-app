const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name:{
        type:String
    },
    discount:{
        type:String
    },
    vendorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive:Boolean,
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const coupon = mongoose.model('Coupon',couponSchema);

module.exports = coupon;