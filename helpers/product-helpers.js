var db= require('../config/connection');
var collection = require('../config/collections');
const { resolve } = require('express-hbs/lib/resolver');
var objectId=require('mongodb').ObjectId;
module.exports = {
    addProduct:(product,callback) => {
        product.Price=parseInt(product.Price);
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {         //inserting the data to the DB in the given collection
            console.log(data);
            y = data.insertedId.toString();                  //getting the collection id as a string
            callback(y);                                     //returning the collection id to addProduct in 'admin.js' for saving image name
        })
    },
    getAllProducts:() => {
        return new Promise(async(resolve,reject) => {
            let products =await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();   //getting the data from the DB of the given collection
            resolve(products)                      //this helps to view all products for the admin
        })
    },
    deleteProduct:(proId) => {
        console.log(objectId(proId))
        return new Promise((resolve,reject) => {           /* Helps to delete a product detail from database */
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response) => {
                resolve(response);
            })
        })
    },
    getProductDetails:(proId) => {
        return new Promise((resolve,reject) => {             /* Hepls to get the data of selected product id */
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product) => {
                console.log(objectId(proId));
                resolve(product);
            })
        })
    },
    updateProduct:(proId,proDetails) => {
        return new Promise((resolve,reject) => {           /*  Helps to update data in database */
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set: {
                    Name:proDetails.Name,
                    Category:proDetails.Category,
                    Price:proDetails.Price,
                    Description:proDetails.Description
                }
            }).then((response) => {
                resolve();
            })
        });
    }
}
