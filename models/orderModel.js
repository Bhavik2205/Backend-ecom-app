const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name:{
        type:String
    },
    address:{
        type:String
    },
    pincode:{
        type:String
    },
    mobile:{
        type:String
    },
    locality:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    addressName:{
        type:String
    },
    paymentStatus:{
        type:String
    },
    transaction:{
        type:Object
    },
    orderStatus:{
    type:String
    },
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const order = mongoose.model('Order',orderSchema);

module.exports = order;