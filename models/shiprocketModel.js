const mongoose = require('mongoose');

const shipSchema = new mongoose.Schema({
    token:{
        type:String
    },
    expireDate:{
   type:String
    },
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const ship = mongoose.model('shiprocket',shipSchema);

module.exports = ship;