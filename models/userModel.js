const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required: true,
    },
    confirmPassword:{
        type:String,
        required: false,
    },
    mobile:{
        type:String,
        required:true,
    },
    role:{
        type: Boolean,
        default: false,
    },
    isBlocked:{
        type: Boolean,
        default: false,
    },
    isVerified:{
        type:Boolean,
        default:false,
    }
},{timestamps:true});


const user = mongoose.model('User', userSchema);

module.exports = user;