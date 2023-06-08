const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    videoId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reel'
    },
    description:{
        type:String
    },
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const comment = mongoose.model('comment',commentSchema);

module.exports = comment;