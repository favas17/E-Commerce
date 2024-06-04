const mongoose = require('mongoose');



const checkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    item: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PRODUCT',

        },
        quantity: {
            type: Number,
            required:true,
        },
        price:{
            type: Number,
            required:true,
        },
    }],
    totalQuantity: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address',
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    orderDate: {
        type: Date,
        deafult: Date.now,
    },
});



const checkout = mongoose.model('checkout',checkoutSchema);

module.exports = checkout;