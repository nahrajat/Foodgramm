const mongoose = require('mongoose');
const foodPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    contactName: { type: String, required: true },
     phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhoto: { type: String, trim: true },
    restaurantName: { type: String, required: true },
    address: { type: String, required: true },
   
}, { timestamps: true });

const FoodPartnermodel = mongoose.model('FoodPartner', foodPartnerSchema);

module.exports = FoodPartnermodel;
