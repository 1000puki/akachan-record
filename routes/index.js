var express = require('express');
var router = express.Router();
const Baby = require('../models/babies');

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = '赤ちゃんレコード（AkaReco）';
  if(req.user){
    Baby.findAll({
      where: {
        userId: req.user.id
      },
      order: [['updatedAt', 'ASC']]
    }).then((babies) => {
        res.render('index', {
          title: title,
          user: req.user,
          babies: babies
        });
    });
  } else {
    res.render('index', { title: 'Express', user: req.user });    
  }
});

module.exports = router;
