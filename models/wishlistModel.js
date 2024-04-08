const mongoose = require('mongoose');
const productModel = require('../models/productModel')


const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    product : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PRODUCT',    
    }]
})


const wishlist = mongoose.model('Wishlist',wishlistSchema);

module.exports = wishlist;