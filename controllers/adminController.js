const mongoose = require('mongoose');
const PRODUCT = require('../models/productModel');
const CATEGORY_MODEL = require('../models/categoryModel');
const user = require('../models/userModel')
const path = require('path')
const multer = require('multer');
const COUPON_MODEL = require('../models/couponModel');
const order_Model = require('../models/orderModel');
const banner_Model = require('../models/bannerModel');
const categoryModel = require('../models/categoryModel');
const category = require('../models/categoryModel');

const loadAdminHome = async (req,res)=>{
    try {
        res.render('adminHome')
    } catch (error) {
        res.render('404')
    }
}

const loadAddProduct = async (req,res)=>{
    try {
        const categories = await CATEGORY_MODEL.find().select('category');
        res.render('addProduct',{categories})
    } catch (error) {
        res.render('404')
    }
}

const postAddProduct = async(req,res)=>{
    try {
        const {productName,price,discountPrice,details,stock,categorie,brand,tags} = req.body;
        console.log(productName,price,details,stock,tags)
        const image1 = req.files['image1'][0].filename
        const image2 = req.files['image2'][0].filename
        const image3 = req.files['image3'][0].filename

        const newProduct = new PRODUCT({
            name: productName,
            productImage1: image1,
            productImage2: image2,
            productImage3: image3,
            price: price,
            discountPrice: discountPrice,
            details: details,
            stock: stock,
            categorie: categorie,
            brand: brand,
            tags: tags,


        })

        await newProduct.save();
        res.redirect('/adminHome')
    } catch (error) {
        console.error(error);
    }
}


const loadAdminProduct = async (req,res)=>{
    try {
        const product = await PRODUCT.find();
        if(!product){
            return res.status(404).send('products not found')
        }
        res.render('adminProduct',{product});
    } catch (error) {
        res.render('404')
    }
}

// product deleting
const deleteProduct = async (req,res)=>{
    try {
        // find the product using product id and delete it
        const deletedProduct = await PRODUCT.findByIdAndDelete(req.params.productId);
        res.redirect('/adminProduct')
    } catch (error) {
        console.error(error);
    }
}

// product editing page
const editPage = async (req,res)=>{
    try {
        // find all available products and send it to the editing page
        const product = await PRODUCT.findById(req.params.productId);
        if(!product){
            return res.status(404).send('product not found')
        }
        res.render('editProduct',{product})
    } catch (error) {
        res.render('404')
    }
}


// edit posting
const editPost = async (req,res)=>{

    // checking the product id
    const productId = req.params.productId;
    console.log(productId)

    // if there is product id the destructure the data
    if(productId){
        let {name,price,discountPrice,category,details,stock} = req.body;

        // addingwt it into product variable
        const product = {
            name: name,
            price: price,
            discountPrice: discountPrice,
            category: category,
            details: details,
            stock: stock
        }

        // checking ehich photo is uploaded
        if(req.files['image1']) {
            product.productImage1 = req.files['image1'][0].filename
        }

        if(req.files['image2']){
            product.productImage2 = req.files['image2'][0].filename
        }

        if(req.files['image3']){
            product.productImage3 = req.files['image3'][0].filename
        }
        
        // updating the product by the dataas in the product field using set opperator
        try {
            await PRODUCT.findOneAndUpdate({ _id: productId},
                {
                    $set: product
                })
                res.redirect('/adminProduct')
        } catch (error) {
            console.error(error)
        }
        
    }

    

}

// getting userList page
const userList = async (req,res)=>{
    try {
        const users = await user.find();
        res.render('userList',{users})
    } catch (error) {
        res.render('404')        
    }
}


// delete user
const deleteUser = async (req,res)=>{
    try {
        // finding user by id and deleting the user
        const deleted = await user.findByIdAndDelete(req.params.userId);
        if(!deleted){
            return res.status(404).send('user not found')
        }
        res.redirect('/userList')
    } catch (error) {
        console.error(error)
    }
}


// load category page
// const loadCategory = async (req,res)=>{
//     try {
//         res.render('category')
//     } catch (error) {
//         res.render('404')
//     }
// }


// // category posting
// const postCategory = async (req,res)=>{
//     const {category,subcategories} = req.body;
//     try {
//         const existingCategorie = await CATEGORY_MODEL.findOne({ category })
//         if(existingCategorie){
//             return res.status(400).send('category already exist')
//         }

//         const categories = new CATEGORY_MODEL({category});
        
//         await categories.save();
//         res.redirect('category')


// } catch (error) {
//         console.error(error)
// }
    
// }


// load coupon page
const loadCoupon = async (req,res)=>{
    try {
        res.render('coupon')        
    } catch (error) {
        res.render('404')
    }
}



// post coupen page
const uploadCoupon = async (req,res)=>{
    const {couponCode,discount,minimumPurchase,validFrom,validTo} = req.body;
    console.log(couponCode,discount,minimumPurchase,validFrom,validTo)
    const existingCode = await COUPON_MODEL.findOne({ couponCode: couponCode} );
    if(existingCode){
        return res.status(400).send('this coupen already is exist')
    }
    const coupon = new COUPON_MODEL({
        couponCode,
        discount,
        minimumPurchase,
        validFrom,
        validTo,
    })
    await coupon.save()
    res.status(200).send('coupen created succesfully')
}

// load add category
const loadAddCategory = async (req,res)=>{
    try {
        const categ = await CATEGORY_MODEL.find();
        res.render('category',{categ});
    } catch (error) {
        console.error(error);
        res.render('404')
    }
}

// add category
const addCategory = async (req,res)=>{
   const {categoryName} = req.body;
    categ = await CATEGORY_MODEL.findOne({category:categoryName});//fetching category from database
    if(categ){
        return res.status(404).send('user alredy exist');
        res.redirect('/adminHome')
    };
    
    try{
    const  category_list = new CATEGORY_MODEL({
        category: categoryName,
    })
    await category_list.save();
    
    res.redirect('/category');
   }
   catch(error){
    console.error(error);
   }
}


// const addSubcategory = async (req,res)=>{
//     const subcategoryName = req.body;
//     const parentCategory = req.body;
    
 
//     try{
//     const checkcateg = await CATEGORY_MODEL.findOne({category: parentCategory})
//     const checkArray = checkcateg.subcategory
//     console.log(checkArray);
//     checkArray.push(subcategoryName);
//     console.log(checkArray);

//     const final = await CATEGORY_MODEL.findByIdAndUpdate(checkcateg._id,{category:checkcateg.category,
//         subcategory:checkArray});
//     res.redirect('/category')
//     }
//     catch(error){
//         console.error(error)
//     }


// }

// add subcategory
const addSubcategory = async (req, res) => {
    const { subcategoryName, parentCategory } = req.body;

    try {
        const parent = await CATEGORY_MODEL.findById(parentCategory);
        if (!parent) {
            return res.status(404).send('parent category not found');
        }
        const checkSub = await CATEGORY_MODEL.findOne({subcategory:subcategoryName});
        if(checkSub){
            return res.status(400).send('Subcategory already exist');
        }
        // Push the new subcategory into the subcategory array of the parent category
        parent.subcategory.push(subcategoryName);

        await parent.save();

        res.redirect('/category');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

//  load edit category
const loadEditCategory = async (req,res)=>{
    try {
        const categories = await CATEGORY_MODEL.find({});
        res.render('editCategory',{categories});
    } catch (error) {
        console.error(error);
        res.render('404')
    }
}

// deleting category
const deleteCategory = async (req,res)=>{
    try{
    const deleted = await CATEGORY_MODEL.findByIdAndDelete(req.params.categoryId);
    console.log(deleted);
    res.sendStatus(200);
    }
    catch(error){
        console.error(error)
        res.status(500).send('server error');
    }
}



// deleting subcategory
const   deleteSubCategory = async (req,res)=>{
    try {
        const deleted = await CATEGORY_MODEL.findByIdAndDelete(req.params.categoryId);
        console.log(deleted);
        res.sendStatus(200);
    } catch (error) {
        console.error(error)
        res.status(500).send('server error');
    }
}

const addproductSub = async (req, res) => {
    try {
        const { category } = req.body
        const foundCategory = await CATEGORY_MODEL.findOne({ category }).select('subcategory');
        
        if (!foundCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const subcategories = foundCategory.subcategory || [];

        res.status(200).json({ subcategories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const adminOrder = async (req,res)=>{
    try {
        const orders = await order_Model.find().populate('user');
        res.render('adminOrder', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}



const updateOrder = async (req,res)=>{
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const order = await order_Model.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.redirect('adminOrder');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}


const getBanners = async (req, res) => {
    try {
        const banners = await banner_Model.find(); // Ensure to await the find() method
    
        res.render('Banners', { banners });
    } catch (error) {
        console.error(error);
        res.render('404'); // Render an error page if there's an issue retrieving banners
    }
};


const editBanner = async (req, res) => {
    try {
        const { id } = req.params; // Get the banner ID from the query parameter
        const banner = await banner_Model.findById(id); // Fetch banner details from the database based on the ID
        
        if (!banner) {
            // If banner with the given ID is not found, render an error page or redirect
            return res.render('404'); // You can customize this based on your requirements
        }
        
        // Render the edit banner page with the retrieved banner details
        res.render('editBanner', { banner });
    } catch (error) {
        console.error(error);
        res.render('500'); // Render an error page in case of any server error
    }
};

const addBannerPage = async (req,res)=>{
    try {
        res.render('addBanner')
    } catch (error) {
        console.error(error);
        res.render('404')
    }
}

const addBannerPost = async (req, res) => {
    const { title, subtitle, description } = req.body; 
    const imageUrl = req.file.filename; // Get filename directly

    try {
        const newBanner = new banner_Model({ title, subtitle, description, imageUrl });
        await newBanner.save();
        res.status(200).send('New banner added successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding new banner');
    }
}

const editBannerPost = async (req, res) => {
    try {
        const { bannerId, title, subtitle, description } = req.body;
        // Find the banner by ID and update its details
        await banner_Model.findByIdAndUpdate(bannerId, { title, subtitle, description });

        res.status(200).send('Banner details updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating banner details');
    }
};



module.exports = {
    loadAdminHome,
    loadAddProduct,
    postAddProduct,
    loadAdminProduct,
    deleteProduct,
    editPage,
    editPost,
    userList,
    deleteUser,
    loadCoupon,
    uploadCoupon,
    loadAddCategory,
    addCategory,
    addSubcategory,
    loadEditCategory,
    deleteCategory,
    deleteSubCategory,
    addproductSub,
    
    // order section
    adminOrder,
    updateOrder,

    // banner section
    getBanners,
    addBannerPage,
    addBannerPost,
    editBanner,
    editBannerPost,
}