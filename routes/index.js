var express = require('express');
var router = express.Router();

/* GET home page. */
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
  res.render('index', { products, admin:true });
});

module.exports = router;
