const FoodPartnerModel = require("../models/foodpartner.models");
const UserModel = require("../models/user.models");
const jwt = require("jsonwebtoken");

async function authFoodPartnerMiddleware(req, res, next) {
    const token = req.cookies && req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'please login first' });
    }
    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);
        const foodPartner = await FoodPartnerModel.findById(decoded.id);
        if (!foodPartner) {
            return res.status(401).json({ message: 'Invalid user' });
        }
        req.foodPartner = foodPartner;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
}

async function authUserMiddleware(req, res, next) {
    const token = req.cookies && req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'please login first' });
    }
    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid user' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
}

async function authGeneralMiddleware(req, res, next) {
    const token = req.cookies && req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'please login first' });
    }
    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);
        const foodPartner = await FoodPartnerModel.findById(decoded.id);
        if (foodPartner) {
            req.foodPartner = foodPartner;
            return next();
        }
        const user = await UserModel.findById(decoded.id);
        if (user) {
            req.user = user;
            return next();
        }
        return res.status(401).json({ message: 'Invalid user' });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
}

module.exports = { authFoodPartnerMiddleware, authUserMiddleware, authGeneralMiddleware };