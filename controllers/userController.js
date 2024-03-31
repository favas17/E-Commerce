const mongoose = require('mongoose');
const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PRODUCT = require('../models/productModel')
const Wishlist_Model = require('../models/wishlistModel')
const cart_Model = require('../models/cartModel');
const wishlist = require('../models/wishlistModel');
const product = require('../models/productModel');
const address_Model = require('../models/addressModel');
const checkout_Model = require('../models/checkoutModel');
const coupon_Model = require('../models/couponModel');
const Category_Model = require('../models/categoryModel')
const order_Model = require('../models/orderModel');    
const { openAsBlob } = require('fs');
const user = require('../models/userModel');
// const updateWishlistUI = require('../scripts/updateWish')
// twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verfifySid = process.nextTick.TWILIO_VERIFY_SID
const client = require('twilio')(accountSid,authToken)
const nodemailer = require('nodemailer');
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
        .then(()=>{
            const secretKey = process.env.JWT_SECRET_KEY
            const expiration = 10000;
            const userId = user._id;
            const token = jwt.sign({userId: userId}, secretKey, {expiresIn: expiration});
            req.session.userToken =  token;
            // console.log(req.session.userToken)
            // req.session.userId = userId;
            // console.log(req.session.userId)
            // req.session.mobile = mobile;
            // console.log(req.session.mobile)
            res.redirect('/otp')
        })
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
            const secretKey = process.env.JWT_SECRET_KEY;
            const expiration = 10000;
            const userId = userData._id;
            const token = jwt.sign({ userId: userId}, secretKey, {expiresIn: expiration});
            req.session.token = token;
            req.session.userId = userData._id;
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
        res.render('otp',{mobile: req.session.mobile});
        const mobile = req.session.mobile;
        const userData = await User.findOne({mobile: mobile});
        if(userData){
            client.verify.v2
            .services(process.env.TWILIO_VERIFY_SID)
            .verifications.create({to: '+91' + mobile, channel: "sms"})
            req.session.mobile = mobile;
        }
        
    } catch (error) {
        console.error(error)
        res.render('404')
    }
}


const verifyOtp = async (req,res)=>{
    try {
        const otp = req.body.otp
        const mobile = req.session.mobile
        client.verify.v2
        .services(process.env.TWILIO_VERIFY_SID)
        .verificationChecks.create({to: '+91' + mobile, code: otp})
        .then(async (verification)=>{
            if(verification.status == "approved"){
                console.log(verification.status)
            }else{
                res.status(401).send('user not register')
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('server error')
    }
}


// user home page
const loadUserPage = async (req,res)=>{
    try {

        // getting the categories of men and women
        const menCategory = await Category_Model.findOne({category:'Men'}).select('subcategory');
        const womenCategory = await Category_Model.findOne({category:'Women'}).select('subcategory');


        const page = parseInt(req.query.page) || 1; // Current page number
        const perPage = 10; // Number of items per page
        const totalProducts = await PRODUCT.countDocuments(); // Total number of products
        const totalPages = Math.ceil(totalProducts / perPage); // Total number of pages

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

// wish list
const loadWishlist = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const wishlist = await Wishlist_Model.find({user:userId}).populate('product')
        // console.log(wishlist[0].product)
        res.render('wishlist',{wishlist:wishlist[0].product})
    } catch (error) {
        console.error(error);
        res.render('404')
    }
}


// add to wishlist button work
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



// delete wishlist item
const deleteWishlist = async (req,res)=>{
    
    try {
        // getting user id from session
        const userId = req.session.userId;
        const productId = req.params.productId;
        // findingthe product in the database and pulling that which matches the product id that passed
        const deleted = await Wishlist_Model.findOneAndUpdate(
            {user:userId},
            // pull used to pull out the product
            {$pull: { product: productId  } },
            // used to give or rturn the updated document
            { new: true}

            );
            // sned the message if the product not found in database
            if(!deleted){
                return res.status(404).json({message:'product not found in wishlist'})
            }
            // send if deletion succesfull
        return res.status(200).json({message: 'item deleted successfully'});
    } catch (error) {
        console.error(error)
        res.status(500).json({message:'network error'})
    }
}

// loads the product individually when clicking on the product
const loadDetails = async (req,res)=>{
    try {
        const productId = req.params.productId
        // the product wil get using the produc id and pass it to details page
        const product = await PRODUCT.find({_id: productId});
        res.render('details',{product})
    } catch (error) {
        console.log(error)
        res.render('404')
    }
}





// addToCart button work
const addToCart = async (req, res) => {
    // get the id from session and product id from params
    const userId = req.session.userId;
    const productId = req.params.productId;
    // find the product from database using the product id amd put it into productFind
    const productFind = await PRODUCT.findOne({ _id: productId });
    // get the plus or minus operation
    const operation = req.params.operation;
    try {
        if (!userId) {  
            return res.status(500).send({ isInCart: false });
        }
        // get the cart of user using userid frm session
        let cart = await cart_Model.findOne({ user: userId });
        // if a user does not have a cart then create
        if (!cart) {
            cart = new cart_Model({
                user: userId,
                items: [{ product: productFind._id, quantity: 1, price: productFind.discountPrice }],
                totalQuantity: 1,
                totalPrice: productFind.discountPrice,
            });
        } else {
            // if user already has a cart then push it into the items arrray

            // loop throug the items array in the cart in each index number
            const existingItemIndex = cart.items.findIndex(item => item.product.equals(productId));
            // if the index is not less than -1 then the operations will work
            if (existingItemIndex !== -1) {
                // get the cart.items to existing items 
                const existingItem = cart.items[existingItemIndex];
                // if the opereation is add
                if (operation === 'add') {
                    // items will update
                    existingItem.quantity += 1;
                    existingItem.price += productFind.discountPrice;
                    cart.totalQuantity += 1;
                    cart.totalPrice += productFind.discountPrice;
                    // if the operatin is minus
                } else if (operation === 'minus' && existingItem.quantity >1) {
                    // update the datas
                    existingItem.quantity -= 1;
                    existingItem.price -= productFind.discountPrice;
                    cart.totalQuantity -= 1;
                    cart.totalPrice -= productFind.discountPrice;
                    console.log('Product removed');
                    
                }
            }
            // if ad add to cart works from home page or wishlist or details page
             else {
                // push the items to cart
                    cart.items.push({ product: productFind._id, quantity: 1, price: productFind.discountPrice });
                    cart.totalQuantity += 1;
                    cart.totalPrice += productFind.discountPrice;
            }
        }
        // send the updatedquantity subtotal and grand total to the fetch
        const updatedQuantity = cart.items.find(item => item.product.equals(productId)).quantity;
        const subtotal = cart.items.find(item => item.product.equals(productId)).price;
        const grandTotal = cart.totalPrice;
        // saves the cart to database
        await cart.save();  

        console.log('Product added');
        return res.status(200).send({ message: 'Product added to cart' ,updatedQuantity,subtotal,grandTotal});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Internal server error' });
    }
}



// get cart page
const getCart = async (req,res)=>{
    try {
        const userId = req.session.userId;
        // getting the product in item array inside cart model
        const cart = await cart_Model.findOne({user:userId}).populate('items.product');
        res.render('cart',{cart})
    } catch (error) {
        console.error(error)
    }
}


// delete cart itms
const deleteCart = async (req,res)=>{
    try {
        const productId = req.params.productId;
        const userId = req.session.userId
        // getting the user that matches the userId
        const user = await cart_Model.findOne({user:userId})
        //    getting prodcuts in index order
        const userCart = user.items.findIndex(item => item.product.toString() == productId);
        // if the index value is below 0 then 
        if(userCart === -1){
            return res.status(404).send({message:"product not found"})
        }
        
            user.items.splice(user, 1);

            user.totalQuantity = user.items.reduce((total,item)=>total + item.quantity,0);
            user.totalPrice = user.items.reduce((total,item)=> total + (item.quantity * item.price),0);
            
            const grandTotal = user.totalPrice;
            await user.save()
     
            
        
        return res.status(200).send({message:'Item deleted Successfully',user,grandTotal});
        
    } catch (error) {
        console.error(error)
    }

}


// getting the checkout page
const getCheckout = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const cart = await cart_Model.findOne({user:userId}).populate('items.product')
        const address = await address_Model.find();
        res.render('checkout',{cart,address});
    } catch (error) {
        console.error(error)
        res.render('404')
    }
}

// ading address
const addAddress = async (req,res)=>{
    const {name,address,city,country,postCode,phone,email} = req.body;
    const userId = req.session.userId;

    // console.log(name,address,city,country,postCode,phone,email)
    try {
        // if there no user id
        if(!userId){
            return res.status(500).send('user not found')
        }
        // check the user exist
        let userr = await address_Model.findOne({user: userId});
        //  if user not exist then create a newone
        if (!userr){
            const newAddress = new address_Model({
                user: userId,
                details: [{name,address,city,country,postCode,phone,email,_id:false}],
            })
            // saving the new address
            const saveAddress = await newAddress.save();
         return res.redirect('/myAccount')
        }else{
            // if the usr exist then push using $push the datas into details.
        const updatedAddress =  await address_Model.findByIdAndUpdate(
            userr._id,
            {$push: {details:{name,address,city,country,postCode,phone,email} } },
            // new used to identify the updation updated
            {new:true}
        )
        return res.redirect('/myAccount');
        }
    } catch (error) {
        console.error(error)
        res.status(500).send({message: 'server error'})
    }
}


// my account page
const myAccount = async (req,res)=>{
    try {
        const orders = await order_Model.find().populate('items.product').populate('shippingAddress');
        res.render('myAccount',{orders});
    } catch (error) {
        console.error(error);
        res.render('404')
    }
}

// applying coupon
const applyCoupon = async (req,res)=>{
    try {

        const userId = req.session.userId;
        console.log(userId)
        const couponCode = req.body.couponCode.toString();
        console.log(couponCode)

        const totalPrice = req.params.totalPrice;
        
        const coupon = await coupon_Model.findOne({couponCode:couponCode}); 
        console.log(coupon)
        const cart = await cart_Model.findOne({user: userId})

        if(!coupon){
            console.error('coupon code not exist')
        }

        
        const criteria = totalPrice >coupon.minimumPurchase;

        if(!criteria){
            console.error('not reach minimum amount')
        }

        const Discount = totalPrice * coupon.discount / 100;
        const discountPrice = totalPrice - Discount;
        cart.totalPrice = Math.round(discountPrice);

        const GrandTotal = cart.totalPrice
       await cart.save()
       

    
        
        return res.status(200).send({message:'coupon applied succesfully',GrandTotal})
    

      
    }
    catch (error) {
        console.error(error)
    }
}


const orderOtp = async (req,res)=>{
    try {
        const email = req.session.email;
        // getting otp from genarate otp function
        const otp = genarateOtp();
        req.session.otp = otp;
        // nodmailer
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: "favasfvs111@gmail.com",
                pass: 'mltp emiy bymt baar'
            }
        });
        // Set up email data
        let mailOptions = {
            from: 'favasfvs111@gmail.com',
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${otp}`
        };
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.send('Error sending email.');
            } else {
                res.status(200).json({message:'otp sended'});
            }
        });
    
    }      
     catch (error) {
        console.error(error);
    }
}

const postOrderOtp = async (req,res)=>{
    try {
        // getting the otp from body
       const {otp} = req.body;
       const sotp = req.session.otp

    //    checking the otp entered by user and the seded otp is same
    if(otp == sotp){
        res.redirect('/orderSuccess')
    }else{
        res.redirect('/orderOtp')
    }


    } catch (error) {
        console.error(error)
    }
}


const razorpayOrder = async (req,res)=>{
    try {
        const selectedAddressId = req.body.selectedAddressId.toString();

        if(!selectedAddressId){
            res.status(500).json({message:'please select the address'})
        }
        const cart = await cart_Model.findOne({user:req.session.userId});
        const amount = cart.totalPrice * 100

        // Create Razorpay order
        const options ={
            amount: amount,
            currency: 'INR'
        };

        const razorpayOrderss  = await razorpayOrdersCreate.orders.create(options)
        res.status(200).json({razorpayOrderss})
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const razOrderStoring = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const orderData = req.body;
        console.log(orderData,'hy')
        const selectedAddressId = req.body.selectedAddressId.toString()
        const orderAll =req.body
        console.log(orderAll,'okok')
        const cart = await cart_Model.findOne({user:userId});
        const address = await address_Model.findOne({_id:selectedAddressId});
        

        const order = new order_Model({
            orderId: orderData.orderDetails.id,
            user:userId,
            items:cart.items,
            totalPrice: cart.totalPrice,
            totalQuantity: cart.totalQuantity,
            shippingAddress: selectedAddressId,
            status:'Pending',
            createdAt: new Date()
        })

        const savedOrder = await order.save();
        console.log(orderData)
    } catch (error) {
        console.error(error)
    }
}


const orderSuccess = async (req,res)=>{
    try {
        res.render('orderSuccess');
    } catch (error) {
        console.error(error)
    }
}




// categories for hoe page
const categoriesHome = async (req,res)=>{
    try {
        const categories = await Category_Model.find();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}



// search
const search = async (req,res)=>{
    try {
        // Get the search query from the request query parameters
        const page = +req.query.page || 1; // Get page number from query parameters, default to 1 if not provided

        const totalItems = await PRODUCT.countDocuments({ name: { $regex: query, $options: 'i' } });
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const product = await PRODUCT.find({ name: { $regex: query, $options: 'i' } })
        .skip(skip)
        .limit(ITEMS_PER_PAGE);

         res.render('userHome', { 
            product, 
            currentPage: page, 
            hasNextPage: page < totalPages, 
            hasPreviousPage: page > 1, 
            nextPage: page + 1, 
            previousPage: page - 1, 
            lastPage: totalPages 
        });
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    loadSignup,
    verifySignup,
    loadLogin,
    verifyLogin,
    loadOtp,
    verifyOtp,
    loadUserPage,
    loadWishlist,
    addToWishlist,
    deleteWishlist,
    loadDetails,
    addToCart,
    getCart,
    deleteCart,
    getCheckout,
    addAddress,
    myAccount,
    applyCoupon,
    orderOtp,
    postOrderOtp,
    orderSuccess,
    razorpayOrder,
    razOrderStoring,
    categoriesHome,
    search,
}