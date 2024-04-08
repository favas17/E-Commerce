const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/multer');


router.get('/adminHome',adminController.loadAdminHome);
router.get('/addProduct',adminController.loadAddProduct);
router.post('/addProduct',upload.fields([
    {name: 'image1'},
    {name: 'image2'},
    {name: 'image3'}
]),adminController.postAddProduct);
router.get('/adminProduct',adminController.loadAdminProduct);
router.post('/deleteProduct/:productId',adminController.deleteProduct);
router.get('/editProduct/:productId',adminController.editPage);
router.post('/editPost/:productId',upload.fields([
    {name: 'image1'},
    {name: 'image2'},
    {name: 'image3'}
]),adminController.editPost);

// user list page
router.get('/userList',adminController.userList);
router.post('/deleteUser/:userId',adminController.deleteUser);

// category page
// router.get('/category',adminController.loadCategory);
// router.post('/category',adminController.postCategory);




// coupon page
router.get('/coupon',adminController.loadCoupon);
router.post('/uploadCoupon',adminController.uploadCoupon);


// category page
router.get('/category',adminController.loadAddCategory);
router.post('/addCategory',adminController.addCategory);
// addSubcategory
router.post('/addSubcategory',adminController.addSubcategory);
// edit category loading
router.get('/EditCategory',adminController.loadEditCategory);
// delete category
router.post('/deleteCategory/:categoryId',adminController.deleteCategory);
// delete subcategory
router.post('/deleteSubcategory/:categoryId/:subcategory',adminController.deleteSubCategory)
// addproduct page subcategory getting
router.post('/subcategories',adminController.addproductSub)
// admin order page
router.get('/adminOrder',adminController.adminOrder);
// updating order status
router.post('/updateOrder/:orderId',adminController.updateOrder);

// banner routes
router.get('/Banners',adminController.getBanners);
// addBanner page
router.get('/addBannerPage',adminController.addBannerPage);
// adding banner to database
router.post('/addBanner',upload.single('image'), adminController.addBannerPost);
// edit banner
router.get('/editBanner/:id',adminController.editBanner);
router.post('/editBannerPost',adminController.editBannerPost);




module.exports = router;