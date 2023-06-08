const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    videoId:{
        type:String
    },
    description:{
        type:String
    },
    products:{
        type:Array
    },
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const reel = mongoose.model('reel',reelSchema);

module.exports = reel;