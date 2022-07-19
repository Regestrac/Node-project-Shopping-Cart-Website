var db= require('../config/connection');
var collection = require('../config/collections');

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
    }
    
}