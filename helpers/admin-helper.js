const { resolve } = require("express-hbs/lib/resolver");
const { response } = require("../app");
const { ADMIN_COLLECTION } = require('../config/collections');
const bcrypt = require('bcrypt');

var db = require('../config/connection');
var collection = require('../config/collections');

module.exports={
    doSignup: (adminData) => {            //getting data from signup form
        return new Promise(async (resolve, reject) => {
            adminData.Password = await bcrypt.hash(adminData.Password, 10);       //hashing of password
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {      // inserting the data to database
                resolve(data);
            })
        })
    },
    doLogin: (adminData) => {           //getting data from login form
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ adminId: adminData.adminId }); //checking for the entered admin ID in database
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {       // comparing the password hashes if ID is available
                    if (status) {
                        console.log("Login Success");     //if the entered password matches with DB password
                        response.admin = admin;
                        response.status = true;            //login status is set to true and returned to doLogin in admin.js
                        resolve(response);
                    }
                    else {
                        console.log("Login Failed");   //if the entered password didn't match with DB password
                        resolve({ status: false });       //login status is set to false and returned to doLogin in 'admin.js' file in routes folder
                    }
                })
            }
            else {
                console.log("Login Failed");     //if no admin ID found in DB then the login fails 
                resolve({ status: false });         //login status is set to false and returned to doLogin in 'admin.js' file in routes folder
            }
        })
    }
}