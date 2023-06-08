const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      productName: { type: String},
      quantity: { type: Number},
      combination: { type: Array},
      price: { type: Number },

    }
  ],
    created:{
      type: Date,
      default: function() {
        return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
      }
    }
})

const cart = mongoose.model('cart',cartSchema);

module.exports = cart;