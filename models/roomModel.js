const mongoose = require('mongoose');

const userRoomMap = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    roomId: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: function() {
          return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        }
    }
});

const roomUserMap = mongoose.model("roomUserMap", userRoomMap);

module.exports = roomUserMap;
