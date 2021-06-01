const router = require('express').Router();
const auth = require('../helpers/auth');

//Router To render dashboard page
router.get('/', auth, (req, res)=>{
    res.render('blank/index');
})

module.exports = router;