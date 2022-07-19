var express = require('express');
var router = express.Router();
var productHelper= require('../helpers/product-helpers')

const { render } = require('../app')
const productHelpers = require('../helpers/product-helpers')


router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products) => {        //get details of all products from database
    res.render('admin/view-products',{admin:true, products,});   //the products are shown in table for admin
  })
  
});
router.get('/add-product', (req,res) => {  //when Add New Product is clicked from admin pannel
  res.render('admin/add-product')          // a form to add new product is shown
})
router.post('/add-product',(req,res) => { //when new product is added to DB the following functions are executed
  console.log(req.body);                  //the data from the form is printed to console
  console.log(req.files.Image)            //printing data of image 
  productHelper.addProduct(req.body, (id) => {      //on clicking add product in the form data send to addProduct in product-helpers.js
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.png',(err,done) => {   //image is saved in product-images folder with collection id name
      if(!err){
        res.render("admin/add-product")          //If no errors occurs the form will refresh to add new product
      }
      else {
        console.log(err)
      }
    }) ;
  });
})
module.exports = router;
