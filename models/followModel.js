const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    following:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created:{
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
})

const follow = mongoose.model('follow',followSchema);

module.exports = follow;