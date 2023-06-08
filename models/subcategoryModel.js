const mongoose = require('mongoose');

const subcatSchema = new mongoose.Schema({
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    name:{
        type:String
    },
    slug:{
        type:String
    },
    description:{
        type:String
    },
   attribute:{
   type:Array
   },
    isActive:Boolean,
    created:{
        type: Date,
        default: Date.now(),
    }
})

const subcat = mongoose.model('Subcategory',subcatSchema);

module.exports = subcat;