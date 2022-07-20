var db= require('../config/connection');
var collection = require('../config/collections');
var objectId=require('mongodb').ObjectId;

const bcrypt = require('bcrypt');    //password hashing function

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
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})  //checks if collection already exists
            if(userCart){
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $push:{products:objectId(proId)}       /* Pushes product to cart in DB  */
                    }
                ).then((response)=>{
                    resolve();
                })
            }else{
                let cartObj = {
                    user:objectId(userId),
                    products:[objectId(proId)]
                }                                                    /* new collection created for cart if not already exist */
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
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        let:{prodList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id',"$$prodList"]
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)  //passes the data to products of getCartProducts in user.js
        })
    }
    
}