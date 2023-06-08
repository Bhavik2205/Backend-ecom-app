const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    attribute:{
     type:Array
    },
    image:{
    type:String
    },
    isActive:Boolean,
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const cat = mongoose.model('Category',catSchema);

module.exports = cat;