const router = require('express').Router();
const UserModel = require('../schema/userSchema');
const OtpModel = require('../schema/otpSchema');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const mailer = require('../helpers/mailer');
const  uid = require('rand-token').uid;


//Route To Render Login Page
router.get('/login', (req, res) => {
    res.render('auth/login', { errorMessage: '', email: '', password: '' });
});

//Route To Make User LogIn 
router.post('/login', async (req, res) => {
    try {
        let user = await UserModel.findOne({ email: req.body.email });
        console.log(user);
        if (!user)
            res.render('auth/login', { errorMessage: 'User Does Not Exist', email: req.body.email, password: req.body.password });

        else if (!user.isVerified)
            res.render('auth/login', { errorMessage: 'Account Is Not Verified, Please Verify', email: req.body.email, password: req.body.password });
        else {
            let isPasswordMatches = await bcrypt.compare(
                req.body.password,
                user.password
            );

            if (isPasswordMatches) {
                req.session.userId = user._id;
                req.session.email = user.email;
                req.session.name = user.firstName + ' ' + user.lastName;

                res.redirect('/');

            } else {
                res.render('auth/login', { errorMessage: 'Invalid Credentials', email: req.body.email, password: req.body.password });
            }
        }
    } catch (err) {

    }
})

//Route To Render Register User Page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

//Route To Create New User
router.post('/register', async (req, res) => {
    try {
        //Using Async/Await
        let newUser = req.body;
        newUser.password = await bcrypt.hash(req.body.password, 10);
        await new UserModel(newUser).save();

        //to generate the otp
        let otp = otpGenerator.generate(4, { alphabets: false });

        await new OtpModel({ otp: otp, email: newUser.email }).save();
        //Send OTP To User
        await mailer(newUser.email, "OTP For Verification", `Your OTP Is: ${otp}`);


        res.redirect('/auth/verifyOtp');

        //Using Callback functions
        // bcrypt.hash(req.body.password, 10, (err, val)=>{
        //     newUser.password = val;
        //     newUser = new UserModel(newUser);
        //     newUser.save((err)=>{
        //         if(err){
        //             throw err;
        //         }else
        //         res.redirect('/auth/login');
        //     })
        // })
    } catch (err) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
});

//Route To Log Out User
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
})

//Route To Render Verify OTP Page
router.get('/verifyOtp', (req, res) => {
    res.render('auth/otp', { email: '', otp: '', errorMessage: "" });
});

//route to verify Otp
router.post('/verifyOtp', async (req, res) => {
    try {
        let otpData = await OtpModel.findOne({ email: req.body.email });
        //Check For Otp Data , if it does not exist return error otherwise proceed further
        if (!otpData)
            return res.render('auth/otp', { email: req.body.email, otp: req.body.otp, errorMessage: "Invalid Otp" })

        //Check Whether Otp Matches Or Not, if it matches make user verified, otherwise return error
        if (otpData.otp == req.body.otp) {
            await UserModel.findOneAndUpdate({ email: req.body.email }, { $set: { isVerified: true } });
            await OtpModel.findOneAndDelete({ email: req.body.email });
            return res.redirect('/auth/login');
        } else
            return res.render('auth/otp', { email: req.body.email, otp: req.body.otp, errorMessage: "Invalid Otp" })
    } catch (err) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
});

//Route to render resent otp page
router.get('/resendOtp', (req, res) => {
    res.render('auth/resendOtp', { email: '', errorMessage: '' });
});

//Route to resend otp to user
router.post('/resendOtp', async (req, res) => {
    try {
        let user = await UserModel.findOne({ email: req.body.email });

        if (!user)
            return res.render('auth/resendOtp', { email: req.body.email, errorMessage: "Invalid Credentials" })
        if (user.isVerified)
            return res.render('auth/resendOtp', { email: req.body.email, errorMessage: "Your account is already verified" });
        else {
            let otp = otpGenerator.generate(4, { alphabets: false });

            //Delete All Existing Otps for the email
            await OtpModel.remove({ email: req.body.email });
            //Create New OTP for Email and save it to db
            await new OtpModel({ otp: otp, email: req.body.email }).save();
            //Send OTP To User
            await mailer(req.body.email, "OTP For Verification", `Your OTP Is: ${otp}`);

            return res.redirect('/auth/login');
        }
    } catch (err) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
});     

//Router to render forget password page
router.get('/forgetPassword', (req, res)=>{
    res.render('auth/forgetPassword', {email: '', errorMessage: ''});
})

//Router to send reset password link
router.post('/forgetPassword', async(req, res)=>{
    try {
        let user = await UserModel.findOne({email: req.body.email});

        if(!user)
            return res.render('auth/forgetPassword', {email: req.body.email, errorMessage: 'Invalid Credentials'});
        else{
           
            let token = uid(16);

            await UserModel.findOneAndUpdate({email: req.body.email}, {$set: {resetToken: token}});

            //Send OTP To User
            await mailer(req.body.email, "Reset Password Link", `Reset Password Link: http://localhost:3000/auth/resetPassword/${token}`);

            return res.redirect('/auth/login');
        }
    } catch (err) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
});
//Router to render reset password page
router.get('/resetPassword/:token', async(req, res)=>{
    res.render('auth/resetPassword',{password: req.body.password, confirmPass: req.body.confirmPass, errorMessage: '', token: req.params.token});
});

//Router to reset password
router.post('/resetPassword', async(req, res)=>{
    try {
        let token = req.body.token;
        let password = await bcrypt.hash(req.body.password, 10);
        let userData = await UserModel.findOneAndUpdate({resetToken: token}, {$set: {password: password}});

        if(!userData)
            res.render('auth/resetPassword',{password: req.body.password, confirmPass: req.body.confirmPass, errorMessage: 'Invalid Credentials', token: token});
        else
            res.redirect('/auth/login');
    } catch (err) {
        
    }
});

module.exports = router;