const mongoose = require('mongoose');



const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
    },
    discount: {
        type: String,
        required: true,
        min:0,
        max:100,
    },
    minimumPurchase:{
        type:Number,
        required: true,
        min:0
    },
    validFrom: {
        type: Date,
        required: true,
    },
    validTo: {
        type: Date,
        required: true,
    }
})

const coupon = mongoose.model('Coupon',couponSchema);



module.exports = coupon;