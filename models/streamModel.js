const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  productId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  hmsRoomId: {
    type: String,
  },
  title: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  type: {
    type: String,
    enum: ["live", "scheduled"]
  },
  isLive: {
    type: Boolean,
  },
  dateTime:{
    type: String
  },
  meetingUrl: {
    type: String,
  },
  created: {
    type: Date,
    default: function() {
      return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
    }
  },
});

const stream = mongoose.model("stream", streamSchema);

module.exports = stream;
