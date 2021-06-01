const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    otp: {type: String}
},  {timestamps: true})


//Create Auto Delete Index(expire after given seconds [automatically] deleted after 900 seconds)
otpSchema.index({createdAt: 1},{expireAfterSeconds: 900});

module.exports = mongoose.model('otps', otpSchema);