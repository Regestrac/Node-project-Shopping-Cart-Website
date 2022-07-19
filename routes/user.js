var express = require('express');
const { response } = require('../app');
var router = express.Router();

const productHelpers = require('../helpers/product-helpers')   //bridging to product-helper.js file in helpers folder
const userHelpers =require('../helpers/user-helpers')    //bridging to user-helper.js file in helpers folder

/* GET home page. */
router.get('/', function(req, res, next) {
  let user=req.session.user;    //checks session status of user
  console.log(user)    //prints user data to console
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products',{products, user});   //shows products page for user , 
  })
});
/* GET login page */
router.get('/login',(req,res) => {
  res.render('user/login');           //shows the login page from the given path
});
/* GET signup page */
router.get('/signup',(req,res) => {
  res.render('user/signup');         //shows the signup page from the given path
});
/*POST signup */
router.post('/signup', (req,res) => {
  userHelpers.doSignup(req.body).then((response) => {        //passes the signup data to doSignup, defined in 'user-helper.js' file
    console.log(response);
    res.redirect('/login');       //redirect to login page after signup
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
      res.redirect('/login');    // if login failed then the login page refreshes
    }
  });
});
/* GET logout */
router.get('/logout', (req,res) => {   
  req.session.destroy();         // when logout button is clicked the active sessin will be destroyed
  res.redirect('/');             // then it will redirect to homepage for guests (without active session)
});

module.exports = router;
