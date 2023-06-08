const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    username:{
        type:String
    },
    email:{
        type:String
    },
    phoneNumber:{
        type:String
    },
    password:{
        type:String
    },
    userType:{
        type:String
    },
    image:{
        type:String
    },
    address:{
        type:String
    },
    token:{
        type:String
    },
    roomId:{
        type:String
    },
    authType:{
        type:String
    },
    authId:{
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

const user = mongoose.model('User',userSchema);

module.exports = user;