var db= require('../config/connection');
var collection = require('../config/collections');
module.exports = {
    addProduct:(product,callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {         //inserting the data to the DB in the given collection
            console.log(data);
            y = data.insertedId.toString();                  //getting the collection id as a string
            callback(y);                                     //returning the collection id to addProduct in 'admin.js' for saving image name
        })
    },
    getAllProducts:() => {
        return new Promise(async(resolve,reject) => {
            let products =await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()   //getting the data from the DB of the given collection
            resolve(products)                      //this helps to view all products for the admin
        })
    }
}