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
  res.render('admin/add-product',{admin:true})          // a form to add new product is shown
});
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
});
/* To delete a product from admin pannel */
router.get('/delete-product/', (req,res) => {   
  let proId = req.query.id           //get id of collection
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {    //send id of collection to be deleted to deleteProduct in product-helpers.js
    res.redirect('/admin/')
  })
});
/* To edit and change the details of product from adminb pannel */
router.get('/edit-product/:id', async(req,res) => {               
  let product=await productHelpers.getProductDetails(req.params.id);        //get details of product to be edited
  console.log(product);
  res.render('admin/edit-product',{admin:true,product});              //shows the edit page
});
router.post('/edit-product/:id',(req,res) => {             //get input data from edit page
  let id=req.params.id;                                    //get id of collection
  productHelpers.updateProduct(id,req.body).then(() => {   //updates edited data
    res.redirect('/admin');                                //then redirects to admin page
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.png')}      //updates the image
  })
});
module.exports = router;
