const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profilePhoto: { type: String, trim: true },
    password: { type: String,  },
}, { timestamps: true });

const Usermodel = mongoose.model('User', userSchema);

module.exports = Usermodel;