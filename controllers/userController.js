const mongoose = require('mongoose');
const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const sendMail = require("../utilities/nodeMailer")
const PRODUCT = require('../models/productModel')
const Wishlist_Model = require('../models/wishlistModel')
const cart_Model = require('../models/cartModel');
const address_Model = require('../models/addressModel');
const coupon_Model = require('../models/couponModel');
const Category_Model = require('../models/categoryModel')
const order_Model = require('../models/orderModel');    
const Razorpay = require('razorpay');
const ITEMS_PER_PAGE = 10;

const razorpayOrdersCreate  = new Razorpay({
    key_id: 'rzp_test_GxkKU3BnKyKe6Z',
    key_secret: 'I3A5ePFMmFeo5uguWpCSGVjh'
});

function genarateOtp(){
    return Math.floor(1000 + Math.random() * 900);
}

const hash = (password)=>{
    try {
        return bcrypt.hash(password, 10)
    } catch (error) {
        console.error(error)
    }
}

const loadSignup = async (req,res)=>{
    try {
        res.render('signup')
    } catch (error) {
        console.error(error)
        res.render('404')
    }
}

const verifySignup = async (req,res)=>{
    const {username,email,password,confirmPassword,mobile} = req.body;
    if(password !==confirmPassword){
        return res.status(400).send('password not match');  
    }
    try {
        const userData = await User.findOne({ $or: [{mobile:{ $in: [mobile]}}, {email: {$in: [email]}}]});
        if(userData){
            if(userData.email == email){
                res.status(400).send('Email already exist');
            }else{
                res.status(400).send('Mobile number already exist')
            }
        }else{
            const bcryptPassword = await hash(password);
            const user = new User({
                username,
                email,
                password: bcryptPassword,
                mobile,
            });
            await user.save()
            const userId = user._id;
            req.session.userId = userId
            req.session.email = email;
            const GenarateOtp = Math.floor(1000+Math.random()*9000);
            req.session.otp = GenarateOtp 
            res.redirect('/otp')
            await sendMail(email,GenarateOtp);
        }
    } 
    catch (error) {
        console.error(error)
    }
}

const loadLogin = async (req,res)=>{
    try{
        res.render('login')
    }
    catch(error){
        console.error(error)
        res.render('404')
    }
}

const verifyLogin = async (req,res)=>{
    try {
        const {email,password} = req.body;  
        const userData = await User.findOne({email: email});
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                const userId = userData._id;
                req.session.userId = userId;
                req.session.email = userData.email;
                res.redirect('/userHome')
            }
        }
    } catch (error) {
        console.error(error);
        res.status(400).send('password not match');
    }
}

const loadOtp = async (req,res)=>{
    try {
        res.render('otp');
    } catch (error) {
        console.error(error)
        res.render('404')
    }
}

const verifyOtp = async (req,res)=>{
    const sessionOtp = req.session.otp
    const enteredOtp = req.body.otp
    const sessionEmail = req.session.email
    console.log(enteredOtp,"by")
    console.log(sessionOtp, "hy")
    try {
        if(sessionOtp ===Number(enteredOtp) ){
            const isUser = await user.findOneAndUpdate({email:sessionEmail},{$set:{isVerified:true}},{new:true});
            if(isUser){
                res.redirect("/userHome")
            }else{
                res.status(400).send("user not found")
            }
        }else{
            res.status(400).send("OTP is incorrect")
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }   
}

const loadUserPage = async (req,res)=>{
    try {
        const menCategory = await Category_Model.findOne({category:'Men'}).select('subcategory');
        const womenCategory = await Category_Model.findOne({category:'Women'}).select('subcategory');
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalProducts = await PRODUCT.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);
        const product = await PRODUCT.find()
            .skip((page - 1) * perPage)
            .limit(perPage);
        res.render('userHome', {
            product,
            menCategory,
            womenCategory,
            query: req.query.query,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: totalPages
        });
    } catch (error) {
        console.error(error);
    }
}

const loadShop = async (req,res)=>{
    try {
        const menCategory = await Category_Model.findOne({category:'Men'}).select('subcategory');
        const womenCategory = await Category_Model.findOne({category:'Women'}).select('subcategory');
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalProducts = await PRODUCT.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);
        const product = await PRODUCT.find()
            .skip((page - 1) * perPage)
            .limit(perPage);
        res.render('shop', {
            product,
            menCategory,
            womenCategory,
            query: req.query.query,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: totalPages
        });
    } catch (error) {
        console.error(error);
    }
}

const loadWishlist = async (req,res)=>{
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).send('User not logged in');
        }
        const wishlist = await Wishlist_Model.find({user:userId}).populate('product')
        if (!wishlist || !wishlist.product) {
            return res.render('wishlist',{wishlist:wishlist[0].product});
        }
        res.render('wishlist',{wishlist:wishlist[0].product})
    } catch (error) {
        console.error(error);
        res.render('404')
    }
}

const addToWishlist = async (req,res)=>{
    const userId = req.session.userId;
    const productId = req.params.productId;
    try{
        if(!userId){
            return res.status(500).send({isInWishlist: false})
        }
        let wishlist = await Wishlist_Model.findOne({user: userId});
        if(!wishlist){
            wishlist = new Wishlist_Model({
                user:userId,
                product: [],
            });
        } 
        if(wishlist.product.includes(productId)){
            await Wishlist_Model.updateOne({user: userId},{$pull: {product: productId}});
            return res.status(200).send({message: 'Prouduct removed from wishlist', added: false});
        }else{
            wishlist.product.push(productId);
            await wishlist.save();
            return res.status(200).send({message: 'product added successfully', added: true})
        }
    }catch(error){
        console.error(error);
        res.status(500).send({error:'server error'});
    }
}

const deleteWishlist = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;
        const deleted = await Wishlist_Model.findOneAndUpdate(
            {user:userId},
            {$pull: { product: productId  } },
            { new: true}
        );
        if(!deleted){
            return res.status(404).json({message:'product not found in wishlist'})
        }
        return res.status(200).json({message: 'item deleted successfully'});
    } catch (error) {
        console.error(error)
        res.status(500).json({message:'network error'})
    }
}

const loadDetails = async (req,res)=>{
    try {
        const productId = req.params.productId
        const product = await PRODUCT.find({_id: productId});
        res.render('details',{product})
    } catch (error) {
        console.log(error)
        res.render('404')
    }
}

const addToCart = async (req, res) => {
    const userId = req.session.userId;
    const productId = req.params.productId;
    const operation = req.params.operation;
    try {
        if (!userId) {
            return res.status(401).send({ isInCart: false, message: 'User not logged in' });
        }
        const productFind = await PRODUCT.findById(productId);
        if (!productFind) {
            return res.status(404).send({ message: 'Product not found' });
        }
        let cart = await cart_Model.findOne({ user: userId });
        if (!cart) {
            cart = new cart_Model({
                user: userId,
                items: [],
                totalAmount: 0,
            });
        }
        const existingCartItem = cart.items.find((item) => item.product.toString() === productId);
        if (existingCartItem) {
            if (operation === 'decrease') {
                if (existingCartItem.quantity > 1) {
                    existingCartItem.quantity -= 1;
                    cart.totalAmount -= productFind.price;
                }
            } else {
                existingCartItem.quantity += 1;
                cart.totalAmount += productFind.price;
            }
        } else {
            cart.items.push({ product: productId, quantity: 1 });
            cart.totalAmount += productFind.price;
        }
        await cart.save();
        return res.status(200).send({ message: 'Cart updated successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
};

const loadCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const cart = await cart_Model.findOne({ user: userId }).populate('items.product');
        res.render('cart', { cart: cart || { items: [] } }); // Ensure cart is always defined
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};


const deleteCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;
        let cart = await cart_Model.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
        const item = cart.items[itemIndex];
        cart.totalAmount -= item.quantity * item.product.price;
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Network error' });
    }
};

const loadCheckout = async (req, res) => {
    try {
        // Assuming you have a function to get the cart for the user
        const cart = await getCartForUser(req.user.id);

        res.render('checkout', { cart });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


const createOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, mobile, email, house, locality, city, district, state, pincode, paymentMethod } = req.body;
        const cart = await cart_Model.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).send('Cart is empty');
        }
        const newAddress = new address_Model({
            user: userId,
            name,
            mobile,
            email,
            house,
            locality,
            city,
            district,
            state,
            pincode
        });
        await newAddress.save();
        const orderItems = cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));
        const totalAmount = cart.totalAmount;
        const order = new order_Model({
            user: userId,
            items: orderItems,
            totalAmount,
            paymentMethod,
            address: newAddress._id
        });
        await order.save();
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        if (paymentMethod === 'COD') {
            return res.status(200).send({ message: 'Order placed successfully', order });
        } else {
            const options = {
                amount: totalAmount * 100,
                currency: 'INR',
                receipt: 'receipt_order_' + order._id
            };
            razorpayOrdersCreate.orders.create(options, (err, orderResponse) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Error in creating Razorpay order');
                }
                res.status(200).send({
                    order,
                    orderId: orderResponse.id,
                    currency: orderResponse.currency,
                    amount: orderResponse.amount,
                    message: 'Order placed successfully'
                });
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};



const addAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, mobile, email, house, locality, city, district, state, pincode } = req.body;
        const newAddress = new address_Model({
            user: userId,
            name,
            mobile,
            email,
            house,
            locality,
            city,
            district,
            state,
            pincode
        });
        await newAddress.save();
        res.status(200).send('Address added successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const myAccount = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        res.render('myAccount', { user });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const applyCoupon = async (req, res) => {
    try {
        const { totalPrice } = req.params;
        const { couponCode } = req.body;
        const coupon = await coupon_Model.findOne({ code: couponCode });
        if (coupon && coupon.isActive) {
            const discount = (totalPrice * coupon.discountPercentage) / 100;
            const finalPrice = totalPrice - discount;
            res.status(200).send({ finalPrice });
        } else {
            res.status(400).send('Invalid coupon code');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const orderOtp = async (req, res) => {
    try {
        res.render('orderOtp');
    } catch (error) {
        console.log(error);
        res.render('404');
    }
};

const postOrderOtp = async (req, res) => {
    const sessionOtp = req.session.otp;
    const enteredOtp = req.body.otp;
    try {
        if (sessionOtp === Number(enteredOtp)) {
            res.redirect('/orderSuccess');
        } else {
            res.status(400).send('OTP is incorrect');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const razorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: 'receipt_order_' + Date.now()
        };
        const order = await razorpayOrdersCreate.orders.create(options);
        res.status(200).send(order);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const razOrderStoring = async (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        const newOrder = new order_Model({
            orderId: order_id,
            paymentId: payment_id,
            signature: signature
        });
        await newOrder.save();
        res.status(200).send('Order details stored successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const orderSuccess = async (req, res) => {
    try {
        res.render('orderSuccess');
    } catch (error) {
        console.log(error);
        res.render('404');
    }
};

const categoriesHome = async (req, res) => {
    try {
        const categories = await Category_Model.find();
        res.status(200).send(categories);
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};

const search = async (req, res) => {
    try {
        const { query } = req.query;
        const products = await PRODUCT.find({ name: new RegExp(query, 'i') });
        res.render('search', { products });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};



module.exports = {
    loadSignup,
    verifySignup,
    loadLogin,
    verifyLogin,
    loadOtp,
    verifyOtp,
    loadUserPage,
    loadShop,
    loadWishlist,
    addToWishlist,
    deleteWishlist,
    loadDetails,
    addToCart,
    loadCart,
    deleteCart,
    loadCheckout,
    createOrder,
    addAddress,
    myAccount,
    applyCoupon,
    orderOtp,
    postOrderOtp,
    razorpayOrder,
    razOrderStoring,
    orderSuccess,
    categoriesHome,
    search
};

