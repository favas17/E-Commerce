const mongoose = require('mongoose');



const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    subcategory: [{
        type: String
    }]
});


const category = mongoose.model('CATEGORY', categorySchema);


module.exports = category;