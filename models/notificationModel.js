const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    deviceId:{
        type:String
    },
    notification:{
        type:Object
    },
    created:{
        type: Date,
     default: function() {
      return new Date(Date.now() + (5.5 * 60 * 60 * 1000));
     }
    }
})

const notification = mongoose.model('notification',notificationSchema);

module.exports = notification;