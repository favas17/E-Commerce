const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    productImage1: {
        type: String,
    },
    productImage2: {
        type: String,
    },
    productImage3: {
        type: String,
    },
    price: {
        type: Number,
    },
    discountPrice: {
        type: Number,
    },
    details: {
        type: String,
    },

    category: {
        type: String,
    },
    subcategory: {
        type: Array,
    },

});


const product = mongoose.model('PRODUCT',productSchema);



module.exports = product;