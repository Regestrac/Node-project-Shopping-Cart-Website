var express = require('express');
const { response } = require('../app');
var router = express.Router();

const productHelpers = require('../helpers/product-helpers')   //bridging to product-helper.js file in helpers folder
const userHelpers =require('../helpers/user-helpers')    //bridging to user-helper.js file in helpers folder
const verifyLogin = (req,res,next) => {
  if(req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

/* GET home page. */
router.get('/',async(req, res, next) =>{
  let user=req.session.user;    //checks session status of user
  let cartCount=null;
  if(req.session.user) {
    cartCount=await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products',{products, user, cartCount});   //shows products page for user , 
  })
});
/* GET login page */
router.get('/login',(req,res) => {
  if(req.session.loggedIn) {       //if condition given to fix showing login page again without session expiry
    res.redirect('/')
  }
  else {
    res.render('user/login',{"loginErr":req.session.loginErr})    //shows the login page from the given path, displays err msg if page rerirects in the session
    req.session.loginErr=false
  }
});

/* GET signup page */
router.get('/signup',(req,res) => {
  res.render('user/signup');         //shows the signup page from the given path
});
/*POST signup */
router.post('/signup', (req,res) => {
  userHelpers.doSignup(req.body).then((response) => {        //passes the signup data to doSignup, defined in 'user-helper.js' file
    req.session.loggedin=true;
    req.session.user=response.user;
    console.log(response);
    res.redirect('/');       //redirect to home page after signup
  });
});
/* POST login */
router.post('/login',(req,res) => {
  userHelpers.doLogin(req.body).then((response) => {     //passes the login data to doLogin, defined in 'user-helper.js' file
    if(response.status) {                    //checks the session status and if logged in succesfully
      req.session.loggedIn=true;          
      req.session.user=response.user;
      res.redirect('/');          // if login is success then redirect to home page which shows products
    }
    else {
      req.session.loggedIn=false;
      req.session.loginErr=true;  //creating error message if login failed (can provide message instead of boolean)
      res.redirect('/login');    // if login failed then the login page refreshes
    }
  });
});
/* GET logout */
router.get('/logout', (req,res) => {   
  req.session.destroy();         // when logout button is clicked the active sessin will be destroyed
  res.redirect('/');             // then it will redirect to homepage for guests (without active session)
});
/* GET cart page */
router.get('/cart',verifyLogin, async(req,res) => {
  let products= await userHelpers.getCartProducts(req.session.user._id)  //get id of products in cart from DB
  let totalAmount= await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/cart',{products ,user:req.session.user._id,totalAmount});                               //loads cart page
});
/* Adds products to cart */
router.get('/add-to-cart/:id', (req,res)=> {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(()=>{         //passes id of products added to cart
    res.json({status:true});
  })
});
router.post('/change-product-quantity', (req,res,next)=> {
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total= await userHelpers.getTotalAmount(req.session.user._id)
    res.json(response);
  })
});
router.get('/place-order', verifyLogin ,async(req,res)=>{
  let total= await userHelpers.getTotalAmount(req.session.user._id);
  res.render('user/place-order', {total, user:req.session.user});
});
router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId);
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId);
userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
  res.json({status:true})
})
});
router.get('/order-success',verifyLogin, (req,res)=>{
  res.render('user/order-success',{user:req.session.user});
});
router.get('/orders',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrder(req.session.user._id);
  res.render('user/orders',{orders,user:req.session.user});
});
router.get('/view-order-products/:id',verifyLogin, async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id);
  res.render('user/view-order-products',{user:req.session.user, products});
});

module.exports = router;
