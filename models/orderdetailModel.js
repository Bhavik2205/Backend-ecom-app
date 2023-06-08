const mongoose = require('mongoose');

const orderDSchema = new mongoose.Schema({
    orderId:{
        type:String
    },
    vendorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    productName:{
        type:String
    },
    price:{
        type:String
    },
    quantity:{
        type:String
    },
    combination:{
        type:Object
    },
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const orderd = mongoose.model('OrderDetail',orderDSchema);

module.exports = orderd;