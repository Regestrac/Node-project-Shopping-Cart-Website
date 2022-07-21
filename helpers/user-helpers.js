var db= require('../config/connection');
var collection = require('../config/collections');
var objectId=require('mongodb').ObjectId;

const bcrypt = require('bcrypt');    //password hashing function
const { PRODUCT_COLLECTION } = require('../config/collections');

module.exports = {
    doSignup:(userData) => {            //getting data from signup form
        return new Promise(async(resolve,reject) => {
            userData.Password =await bcrypt.hash(userData.Password,10);       //hashing of password
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {      // inserting the data to database
                resolve(data);
            })
        })
    },
    doLogin:(userData)=>{           //getting data from login form
        return new Promise(async(resolve,reject) => {
            let loginStatus=false;
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email}); //checking for the email in database
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status) => {       // comparing the password hashes if email is available
                    if(status) {
                        console.log("Login Success");     //if the entered password matches with DB password
                        response.user=user;
                        response.status=true;            //login status is set to true and returned to doLogin in user.js
                        resolve(response);
                    }
                    else {
                        console.log("Login Failed");   //if the entered password didn't match with DB password
                        resolve({status:false});       //login status is set to false and returned to doLogin in 'user.js' file in routes folder
                    }
                })
            }
            else {
                console.log("Login Failed");     //if no email found in DB then the login fails 
                resolve({status:false});         //login status is set to false and returned to doLogin in 'user.js' file in routes folder
            }
        })
    },
    addToCart:(proId,userId) => {
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})  //checks if collection already exists
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==proId);
                console.log(proExist);
                if(proExist != -1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                        {
                            $push:{products:proObj}       /* Pushes product to cart in DB  */
                        }
                    ).then((response)=>{
                        resolve();
                    })
                }
            }else{
                let cartObj = {
                    user:objectId(userId),
                    products:[proObj]
                }                                                    /* product added to collection when clicked add to cart */
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{     
                    resolve();
                })
            }
        })
    },
    getCartProducts:(userId)=>{              /* Get details of products in a user's cart collection in databade */
        return new Promise(async(resolve,reject) =>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        items:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'"item._id"',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product', 0]}
                    }
                }
            ]).toArray()
            console.log(cartItems);
            resolve(cartItems);
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            
            if(cart){
                count=cart.products.length;
            }
            else{
                count=null;
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart), 'products.item':objectId(details.product)},
            {
                $inc:{'products.$.quantity':details.count}
            }
            ).then(()=>{
                resolve()
            })
        })
    }
    
}