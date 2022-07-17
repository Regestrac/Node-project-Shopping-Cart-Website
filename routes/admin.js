var express = require('express');
var router = express.Router();
var productHelpers= require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  let products=[
    {
      name:"Iphone 12",
      category:"mobile",
      description:"6 GB RAM, 128 GB Storage, Full HD+ Retina Display, 2.5GHz 6 core A15 Bionic Processor",
      image:"https://www.trustedreviews.com/wp-content/uploads/sites/54/2022/03/Samsung-Galaxy-S22-Plus-home-screen-4-scaled.jpg"
    },
    {
      name:"Samsung Galaxy S22 Ultra",
      category:"mobile",
      description:"6 GB RAM, 128 GB Storage, Full HD+ Retina Display, 2.5GHz 8 core Snapdragon 888+ Processor",
      image:"https://www.trustedreviews.com/wp-content/uploads/sites/54/2022/03/Samsung-Galaxy-S22-Plus-home-screen-4-scaled.jpg"
    },
    {
      name:"Xioami 12 Pro",
      category:"mobile",
      description:"6 GB RAM, 128 GB Storage, Full HD+ Retina Display, 2.5GHz 8 core Snapdragon 888+ Processor",
      image:"https://www.trustedreviews.com/wp-content/uploads/sites/54/2022/03/Samsung-Galaxy-S22-Plus-home-screen-4-scaled.jpg"
    },
    {
      name:"IQOO 9 Legend",
      category:"mobile",
      description:"6 GB RAM, 128 GB Storage, Full HD+ Retina Display, 8 core Snapdragon 888+ Processor",
      image:"https://www.trustedreviews.com/wp-content/uploads/sites/54/2022/03/Samsung-Galaxy-S22-Plus-home-screen-4-scaled.jpg"
    }
  ]
  res.render('admin/view-products',{admin:true, products});
});
router.get('/add-product', (req,res) => {
  res.render('admin/add-product')
})
router.post('/add-product',(req,res) => {
  console.log(req.body);
  console.log(req.files.Image)
  productHelpers.addProduct(req.body, (id) => {
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.png',(err,done) => {
      if(!err){
        res.render("admin/add-product")
      } else {
        console.log(err)
      }
    })
    
  })
})

module.exports = router;
