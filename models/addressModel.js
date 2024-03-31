const mongoose = require('mongoose');



const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    details:[{
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required:true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type:String,
            required: true,
        },
        postCode: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    }]
   
});


const address = mongoose.model('address',addressSchema);


module.exports = address;