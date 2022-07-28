var express = require('express');
const { response } = require('../app');
var router = express.Router();

const productHelpers = require('../helpers/product-helpers')   //bridging to product-helper.js file in helpers folder
const userHelpers = require('../helpers/user-helpers')    //bridging to user-helper.js file in helpers folder
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

/* GET home page. */
router.get('/', async (req, res, next) => {
  let user = req.session.user;    //checks session status of user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount });   //shows products page for user , 
  })
});
/* GET login page */
router.get('/login', (req, res) => {
  if (req.session.user) {       //if condition given to fix showing login page again without session expiry
    res.redirect('/')
  }
  else {
    res.render('user/login', { "loginErr": req.session.userLoginErr })    //shows the login page from the given path, displays err msg if page rerirects in the session
    req.session.userLoginErr = false
  }
});

/* GET signup page */
router.get('/signup', (req, res) => {
  res.render('user/signup');         //shows the signup page from the given path
});
/*POST signup */
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {        //passes the signup data to doSignup, defined in 'user-helper.js' file
    req.session.user = response.user;
    req.session.userLoggedin = true;
    console.log(response);
    res.redirect('/');       //redirect to home page after signup
  });
});
/* POST login */
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {     //passes the login data to doLogin, defined in 'user-helper.js' file
    if (response.status) {                    //checks the session status and if logged in succesfully
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect('/');          // if login is success then redirect to home page which shows products
    }
    else {
      req.session.userLoggedIn = false;
      req.session.userLoginErr = true;  //creating error message if login failed (can provide message instead of boolean)
      res.redirect('/login');    // if login failed then the login page refreshes
    }
  });
});
/* GET logout */
router.get('/logout', (req, res) => {
  req.session.user=null;         // when logout button is clicked the active session will be nulled
  req.session.userLoggedIn=false;
  res.redirect('/');             // then it will redirect to homepage for guests (without active session)
});
/* GET cart page */
router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)  //get id of products in cart from DB
  let totalAmount = 0;
  if (products.length > 0) {
    totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
  }
  res.render('user/cart', { products, user: req.session.user, totalAmount });       //loads cart page
});
/* Adds products to cart */
router.get('/add-to-cart/:id', (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {         //passes id of products added to cart
    res.json({ status: true });
  })
});
/* changes the quantity of products in cart database when the + or - key is pressed */
router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.session.user._id)
    res.json(response);
  })
});
/* GET palce order page to fill delivery details */
router.get('/place-order', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let total = 0;
  if (products.length > 0) {
    total = await userHelpers.getTotalAmount(req.session.user._id);   //gets the total price of items checked out to delivery detail page
  }
  res.render('user/place-order', { total, user: req.session.user });  //renders the page
});
/* POSt from place-order page */
router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] == 'COD') {                       //If the selected payment method is COD
      res.json({ codSuccess: true });                                //then it returns true 
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {    //else it generates razorpay instance in serverside
        res.json(response);
      })
    }
  })
});
router.get('/order-success', verifyLogin, (req, res) => {     //renders a page for succesfull checkout
  res.render('user/order-success', { user: req.session.user });
});
router.get('/orders', verifyLogin, async (req, res) => {         //renders a page for viewing the order history
  let orders = await userHelpers.getUserOrder(req.session.user._id);
  res.render('user/orders', { orders, user: req.session.user });
});
router.get('/view-order-products/:id', verifyLogin, async (req, res) => {    //displays the details of each order
  let products = await userHelpers.getOrderProducts(req.params.id);
  res.render('user/view-order-products', { user: req.session.user, products });
});
router.post('/verify-payment', (req, res) => {         //Verifies the onile payment status
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(() => {     //gives necessary feedback
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment Successfull");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })       //sends error message if payment fails
  });
});
router.get('/remove-cart-item/:id',(req,res)=>{
  userHelpers.removeCartItem((req.params.id.split(','))).then((response)=>{
    res.redirect('/cart')
  })
})

module.exports = router;
