var express = require('express');
var router = express.Router();
const auth = require('../helpers/auth');

/* GET home page. */
router.get('/', auth,(req, res, next)=> {
  res.redirect('/dashboard');
});



module.exports = router;
