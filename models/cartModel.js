const mongoose = require('mongoose');



const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    items: [{
        product : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'PRODUCT',
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        price: {
            type: Number,
            required:true,
        },
    }],
    totalQuantity: {
        type: Number,
        required: true,
        default: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
});


const Cart =  mongoose.model('cart',CartSchema);


module.exports = Cart;