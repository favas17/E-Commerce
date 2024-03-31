const mongoose = require('mongoose');



const bannerSchema = new mongoose.Schema({
    title:String,
    subtitle:String,
    description: String,
    imageUrl: String,
})

const Banner = mongoose.model('Banner',bannerSchema);


module.exports = Banner;