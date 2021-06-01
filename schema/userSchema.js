const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String, unique: true},
    password: {type: String},
    isVerified: {type: Boolean, default: false},
    resetToken: {type: String}
});

module.exports = mongoose.model('users', UserSchema);