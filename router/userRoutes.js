const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// load signup
router.get('/signup',userController.loadSignup)
// verify signup
router.post('/signup',userController.verifySignup)
// load login
router.get('/login',userController.loadLogin);
// verify otp
router.post('/login',userController.verifyLogin);
// load otp
router.get('/otp',userController.loadOtp);
// verify otp
router.post('/otp',userController.verifyOtp);
// user home
router.get('/userHome',userController.loadUserPage)
// shop
router.get("/shop",userController.loadShop)
// wishlist
router.get('/wishlist',userController.loadWishlist);
// add to wish list
router.post('/addToWishlist/:productId',userController.addToWishlist)
// delete wishlist item
router.post('/deleteWishlist/:productId',userController.deleteWishlist);
// individual product details
router.get('/details/:productId',userController.loadDetails);
// add to cart
router.post('/addToCart/:productId/:operation',userController.addToCart);
// get cart page
router.get('/cart',userController.getCart);
// delete cart items
router.post('/deleteCart/:productId',userController.deleteCart);
// checkout page
router.get('/checkout',userController.getCheckout);

// address post
router.post('/addAddress',userController.addAddress);
// myAccout
router.get('/myAccount',userController.myAccount);
// applying coupon
router.post('/applyCoupon/:totalPrice',userController.applyCoupon);
// cash on delivery otp page
router.get('/orderOtp',userController.orderOtp);
// cod otp verification
router.post('/orderOtp',userController.postOrderOtp);
// razorpay setup
router.post('/razorpayOrder',userController.razorpayOrder);
// order details saving in razorpay
router.post('/detailsStoring',userController.razOrderStoring)
// orderSuccessfull page
router.get('/orderSuccess',userController.orderSuccess);
// getting categories for home page categorie
router.get('/categoriesHome',userController.categoriesHome);
// searching
router.get('/search',userController.search);

module.exports = router;