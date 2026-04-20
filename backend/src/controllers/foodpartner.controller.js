const foodPartnerModel = require('../models/foodpartner.models');
const foodModel = require('../models/food.models');

async function getFoodPartnerById(req, res) {

    const foodPartnerId = req.params.id;

    const foodPartner = await foodPartnerModel.findById(foodPartnerId)
    const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId })

    if (!foodPartner) {
        return res.status(404).json({ message: "Food partner not found" });
    }

    res.status(200).json({
        message: "Food partner retrieved successfully",
        foodPartner: {
            ...foodPartner.toObject(),
            foodItems: foodItemsByFoodPartner
        }

    });
}

async function getCurrentFoodPartner(req, res) {
    if (!req.foodPartner) {
        return res.status(401).json({ message: "please login first" });
    }

    const foodItemsByFoodPartner = await foodModel.find({ foodPartner: req.foodPartner._id });

    res.status(200).json({
        message: "Current food partner retrieved successfully",
        foodPartner: {
            ...req.foodPartner.toObject(),
            foodItems: foodItemsByFoodPartner
        }
    });
}

module.exports = {
    getFoodPartnerById,
    getCurrentFoodPartner
};