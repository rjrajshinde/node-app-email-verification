const router = require('express').Router();
const e = require('express');
const UserSchema = require('../schema/userSchema');

//Route To Render Register Page
router.get('/register',(req, res)=>{
    res.render('register');
});

//Route To Register New User
router.post('/register', (req, res)=>{
    let newUser = new UserSchema(req.body);

    newUser.save(function(err){
        if(err)
            throw err;
        else
            res.redirect('/');
    })
});
module.exports = router;