var db = require('../config/connection');
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectId;

const bcrypt = require('bcrypt');    //password hashing function
const { PRODUCT_COLLECTION } = require('../config/collections');
const { CART_COLLECTION } = require('../config/collections');
const { resolve } = require('express-hbs/lib/resolver');
const { response } = require('../app');
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_dixWJ1ufkQPN0n',
    key_secret: 'c4uOVdWCG0kr3P9OZbYi6DRP',
});

module.exports = {
    doSignup: (userData) => {            //getting data from signup form
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10);       //hashing of password
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {      // inserting the data to database
                resolve(data);
            })
        })
    },
    doLogin: (userData) => {           //getting data from login form
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email }); //checking for the email in database
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {       // comparing the password hashes if email is available
                    if (status) {
                        console.log("Login Success");     //if the entered password matches with DB password
                        response.user = user;
                        response.status = true;            //login status is set to true and returned to doLogin in user.js
                        resolve(response);
                    }
                    else {
                        console.log("Login Failed");   //if the entered password didn't match with DB password
                        resolve({ status: false });       //login status is set to false and returned to doLogin in 'user.js' file in routes folder
                    }
                })
            }
            else {
                console.log("Login Failed");     //if no email found in DB then the login fails 
                resolve({ status: false });         //login status is set to false and returned to doLogin in 'user.js' file in routes folder
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })  //checks if collection already exists
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId);
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }       /* Pushes product to cart in DB  */
                        }
                    ).then((response) => {
                        resolve();
                    })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }                                                    /* product added to collection when clicked add to cart */
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve();
                })
            }
        })
    },
    getCartProducts: (userId) => {              /* Get details of products in a user's cart collection in databade */
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        items: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: PRODUCT_COLLECTION,
                        localField: 'items',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems);    //resolves data of cart items as array
        })
    },
    getCartCount: (userId) => {    /* fetches the quantity of each product added in cart from database */
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (cart) {
                count = cart.products.length;
            }
            else {
                count = null;
            }
            resolve(count)
        })
    },
    /* Changes the quantity of products in database when changed in cart */
    changeProductQuantity: (details) => {    
        details.count = parseInt(details.count);   //count received in str converted to int
        details.quantity = parseInt(details.quantity);
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {  //count -1 means no matching product in cart 
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true });
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }
                ).then((response) => {
                    resolve({ status: true });
                })
            }
        })
    },
    /* helps to find the total price of all products in cart */
    getTotalAmount: async (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        items: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: PRODUCT_COLLECTION,
                        localField: 'items',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
                    }
                }
            ]).toArray()
            total=total[0].total;
            console.log("Total:***"+total);
               resolve(total); 
        })
    },
    placeOrder: (order, products, total) => {  /*  */
        return new Promise((resolve, reject) => {
            let status = order['payment-method'] === 'COD' ? 'Placed' : 'Pending'   //sets the order status according to type of payment method
            let orderObj = {
                deliveryDetails: {
                    phone: order.phone,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmound: total,
                status: status,
                date: new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {      //new collection added to cart collection when an order is placed
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })   //Deletes the produ7cts from cart when order is placed
                response = response.insertedId.toString();
                resolve(response)

            })
        })
    },
    getCartProductList: (userId) => {   /* Helps to get the details of cart products from database */
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products);
        })
    },
    getUserOrder: (userId) => {        /* Get the order histoy deatials from order collection */
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            console.log(orders);
            resolve(orders);
        })
    },
    getOrderProducts: (orderId) => {    /* helps to display details of each orders */
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([  //aggregate from order collection
                {
                    $match: { _id: objectId(orderId) }      // matching done using id of order collection
                },
                {
                    $unwind: '$products'                   //unwinding the products object from it
                },
                {
                    $project: {
                        items: '$products.item',           //projecting the items
                        quantity: '$products.quantity'     //and quantity from it
                    }
                },
                {
                    $lookup: {
                        from: PRODUCT_COLLECTION,          //looking up from the product collection for matching product details
                        localField: 'items',
                        foreignField: '_id',
                        as: 'order'                       //saving the fetched details as order
                    }
                },
                {
                    $project: {                       //again projecting the 1st index from order object array 
                        item: 1, quantity: 1, order: { $arrayElemAt: ['$order', 0] }
                    }
                }
            ]).toArray()
            resolve(orderItems);
        })
    },
    generateRazorpay: (orderId, total) => {       /* Generating a razorpay instance for online payment */
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId,
            };
            instance.orders.create(options, function (err, orders) {
                console.log("New Order:");
                console.log(orders);
                resolve(orders)
            });
        })
    },
    verifyPayment: (details) => {     /* verifying the payment */
        return new Promise((resolve, reject) => {
            var crypto = require('crypto');      //importing inbuilt library
            let hmac = crypto.createHmac('sha256', 'c4uOVdWCG0kr3P9OZbYi6DRP');     //creating hmac object with sha256 algorithm
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);     //updating it
            hmac = hmac.digest('hex');                                              //converting the hash to hex format
            console.log(hmac);
            if (hmac == details['payment[razorpay_signature]']) {           //comparing it with razorpay signature with above hex
                resolve();                           //resolves the payment as success if it matches
            } else {
                reject();                            //rejects if does'nt match
            }
        })
    },
    changePaymentStatus: (orderId) => {            /* changing the order status of online payment to placed after succesfull payment */
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: 'Placed'          //updating it in the order collecton
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    removeCartItem:(cart)=>{         //cart returns array of 2 strings with cart id and products id
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(cart[0])},   //finding the cart with cart id
            {
                $pull:{
                    products:{                /* Removing the product item from the cart database */
                        item:objectId(cart[1])       
                    }
                }
            },false,true).then((response)=>{
            resolve(response)
            })
        })  
    }
}