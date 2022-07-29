var express = require('express');
var router = express.Router();
var productHelper= require('../helpers/product-helpers')

const { render } = require('../app')
const productHelpers = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helper')
const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect('/admin/admin-login');
  }
};
router.get('/', function(req, res) {
  res.render('admin/welcome',{admin:true});   //the welcome page shown before login
});
router.get('/admin-signup',(req,res)=>{       //signup form for admin
  res.render('admin/admin-signup',{admin:true});
});
router.get('/admin-login',(req,res)=>{       //login form for admin
  if(req.session.admin){
    res.redirect('/')
  }else{
  res.render('admin/admin-login',{admin:true, "loginErr": req.session.adminLoginErr });
  req.session.adminLoginErr = false
  }
});
router.post('/admin-signup', (req, res) => {
  adminHelpers.doSignup(req.body).then((response) => {
    req.session.admin = response.admin;
    req.session.adminLoggedin = true;
    console.log(response);
    res.redirect('/admin/admin-login');
  });
});
router.post('/admin-login', (req, res, next) => {
  adminHelpers.doLogin(req.body).then((response) => {     //passes the login data to doLogin, defined in 'user-helper.js' file
    if (response.status) {                    //checks the session status and if logged in succesfully
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect('/admin/view-products');          // if login is success then redirect to home page which shows products
    }
    else {
      req.session.adminLoggedIn = false;
      req.session.adminLoginErr = true;  //creating error message if login failed (can provide message instead of boolean)
      res.redirect('/admin/admin-login');    // if login failed then the login page refreshes
    }
  });
});
router.get('/admin-logout', (req, res) => {
  req.session.admin=null;         // when logout button is clicked the active session will be nulled
  req.session.adminLoggedIn=false;
  res.redirect('/admin');             // then it will redirect to homepage for guests (without active session)
});
router.get('/view-products', verifyAdminLogin,function(req, res, next) {
  productHelpers.getAllProducts().then((products) => {        //get details of all products from database
    res.render('admin/view-products',{admin:req.session.admin, products});   //the products are shown in table for admin
  })
});
router.get('/add-product', verifyAdminLogin,(req,res) => {  //when Add New Product is clicked from admin pannel
  res.render('admin/add-product',{admin:req.session.admin})          // a form to add new product is shown
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
router.get('/delete-product/',verifyAdminLogin, (req,res) => {   
  let proId = req.query.id           //get id of collection
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {    //send id of collection to be deleted to deleteProduct in product-helpers.js
    res.redirect('/admin/view-products')
  })
});
/* To edit and change the details of product from adminb pannel */
router.get('/edit-product/:id',verifyAdminLogin, async(req,res) => {               
  let product=await productHelpers.getProductDetails(req.params.id);        //get details of product to be edited
  console.log(product);
  res.render('admin/edit-product',{admin:req.session.admin,product});              //shows the edit page
});
router.post('/edit-product/:id',(req,res) => {             //get input data from edit page
  let id=req.params.id;                                    //get id of collection
  productHelpers.updateProduct(id,req.body).then(() => {   //updates edited data
    res.redirect('/admin/view-products');                                //then redirects to admin page
      if(req.files.Image){
        let image=req.files.Image
        image.mv('./public/product-images/'+id+'.png')}      //updates the image
  })
});

module.exports = router;
