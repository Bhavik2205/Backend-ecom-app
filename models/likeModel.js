const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    videoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reel'
    },
    count:{
        type:String
    },
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const like = mongoose.model('like',likeSchema);

module.exports = like;