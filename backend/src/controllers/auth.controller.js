const Usermodel = require("../models/user.models")
const FoodPartnermodel = require("../models/foodpartner.models");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const storageService = require('../services/storage.service');

const isProduction = process.env.NODE_ENV === 'production';

const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setAuthCookie(res, token) {
    res.cookie('token', token, authCookieOptions);
}

function clearAuthCookie(res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
}

// Helper: generate a URL-friendly slug and ensure uniqueness in the given model
async function generateUniqueUsername(base, Model, field = 'username') {
    const makeSlug = (s) => {
        if (!s) return '';
        return String(s)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 30) || 'user';
    };

    const slugBase = makeSlug(base) || 'user';
    let candidate = slugBase;
    let i = 0;
    while (i < 1000) {
        const found = await Model.findOne({ [field]: candidate });
        if (!found) return candidate;
        i += 1;
        candidate = `${slugBase}-${i}`;
    }
    // fallback random suffix
    return `${slugBase}-${Date.now().toString(36).slice(-6)}`;
}

async function registerUser(req, res) {
    const { name, username, email, password } = req.body;
    try {
        let profilePhotoUrl = '';

        if (req.file) {
            if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({ message: 'Profile photo must be an image file' });
            }

            const uploadResult = await storageService.uploadFile(req.file.buffer, randomUUID());
            profilePhotoUrl = uploadResult.url;
        }

        // normalize inputs to avoid duplicates caused by casing or whitespace
        const emailNorm = email ? String(email).toLowerCase().trim() : undefined;
        const usernameNorm = username ? String(username).toLowerCase().trim() : undefined;
        console.log('[registerUser] incoming payload:', { name, username: usernameNorm, email: emailNorm });

        // prevent duplicate emails
        const existingByEmail = await Usermodel.findOne({ email: emailNorm });
        if (existingByEmail) {
            console.log('[registerUser] existingUser found by email:', existingByEmail.email);
            return res.status(400).json({ message: 'User with this email already exists' });
        }

            // choose or generate a username and ensure it's unique; append a short uuid to guarantee uniqueness
            const baseForUsername = usernameNorm || name || emailNorm || 'user';
            const uniqueUsername = await generateUniqueUsername(baseForUsername, Usermodel, 'username');
            // append short UUID segment to make final username unique
            let finalUsername = null;
            for (let attempts = 0; attempts < 5; attempts++) {
                const suffix = randomUUID().split('-')[0];
                const candidate = `${uniqueUsername}-${suffix}`;
                // double-check uniqueness (very unlikely to collide)
                // eslint-disable-next-line no-await-in-loop
                const exists = await Usermodel.findOne({ username: candidate });
                if (!exists) { finalUsername = candidate; break; }
            }
            if (!finalUsername) finalUsername = `${uniqueUsername}-${randomUUID().split('-')[0]}`;

        const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Usermodel.create({
            name,
            username: finalUsername,
            email: emailNorm,
            password: hashedPassword,
            profilePhoto: profilePhotoUrl,
        });
        const token = jwt.sign({ id: newUser._id }, process.env.jwt_secret, { expiresIn: '1h' });
        setAuthCookie(res, token);
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', token, user: {
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            profilePhoto: newUser.profilePhoto,
        } });
    } catch (error) {
        console.error('[registerUser] error:', error);
        if (error && error.code === 11000) {
            const dupField = Object.keys(error.keyValue || {}).join(', ');
            return res.status(400).json({ message: `Duplicate value for field(s): ${dupField}` });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}  

async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const emailNorm = email ? String(email).toLowerCase().trim() : '';
        console.log('[loginUser] login attempt for email:', emailNorm);
        const user = await Usermodel.findOne({ email: emailNorm });
        if (!user) {
            console.log('[loginUser] no user found for:', emailNorm);
            return res.status(404).json({ message: 'User or email not found' });
        }
        if (!user.password) {
            console.log('[loginUser] user has no password set (maybe OAuth user):', user._id);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('[loginUser] password mismatch for:', emailNorm);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
        setAuthCookie(res, token);
        res.status(200).json({ message: 'Login successful', token, user: {
            name: user.name,
            username: user.username,
            email: user.email,
            profilePhoto: user.profilePhoto,
        } });
    } catch (error) {
        console.error('[loginUser] error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

function logoutUser(req, res) {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logout successful' });
}

async function getCurrentUser(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: 'please login first' });
    }

    return res.status(200).json({
        message: 'Current user retrieved successfully',
        user: {
            id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            email: req.user.email,
            profilePhoto: req.user.profilePhoto,
        },
    });
}

async function updateCurrentUser(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: 'please login first' });
    }

    try {
        let nextProfilePhoto = req.user.profilePhoto || '';

        if (req.body.removeProfilePhoto === 'true') {
            nextProfilePhoto = '';
        }

        if (req.file) {
            if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({ message: 'Profile photo must be an image file' });
            }

            const uploadResult = await storageService.uploadFile(req.file.buffer, randomUUID());
            nextProfilePhoto = uploadResult.url;
        }

        if (typeof req.body.name === 'string' && req.body.name.trim()) {
            req.user.name = req.body.name.trim();
        }

        if (typeof req.body.username === 'string' && req.body.username.trim()) {
            const usernameNorm = req.body.username.toLowerCase().trim();
            const usernameTaken = await Usermodel.findOne({ username: usernameNorm, _id: { $ne: req.user._id } });
            if (usernameTaken) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            req.user.username = usernameNorm;
        }

        req.user.profilePhoto = nextProfilePhoto;
        await req.user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                email: req.user.email,
                profilePhoto: req.user.profilePhoto,
            },
        });
    } catch (error) {
        console.error('[updateCurrentUser] error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function registerFoodPartner(req, res) {
    // Expecting body: { name, contactName, phone, email, password, address, restaurantName }
    const { name, contactName, phone, email, password, address, restaurantName } = req.body;
    try {
        let profilePhotoUrl = '';

        if (req.file) {
            if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({ message: 'Profile photo must be an image file' });
            }

            const uploadResult = await storageService.uploadFile(req.file.buffer, randomUUID());
            profilePhotoUrl = uploadResult.url;
        }

        // normalize and log incoming payload for debugging duplicate reports
        const emailNorm = email ? String(email).toLowerCase().trim() : undefined;
        console.log('[registerFoodPartner] incoming payload:', { name, contactName, phone, email: emailNorm, address, restaurantName });

        // email must be unique; contact names can repeat across different businesses
        const existingUser = await FoodPartnermodel.findOne({ email: emailNorm });
        if (existingUser) {
            console.log('[registerFoodPartner] existingUser found by email:', existingUser.email);
            return res.status(400).json({ message: 'Food Partner with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // generate a username for the partner (ensure it won't be null and is unique)
        const baseForUsername = contactName || restaurantName || emailNorm || 'partner';
        const uniqueUsername = await generateUniqueUsername(baseForUsername, FoodPartnermodel, 'username');

        // append a short uuid segment to guarantee uniqueness and avoid null-index conflicts
        let finalPartnerUsername = null;
        for (let attempts = 0; attempts < 5; attempts++) {
            const suffix = randomUUID().split('-')[0];
            const candidate = `${uniqueUsername}-${suffix}`;
            // eslint-disable-next-line no-await-in-loop
            const exists = await FoodPartnermodel.findOne({ username: candidate });
            if (!exists) { finalPartnerUsername = candidate; break; }
        }
        if (!finalPartnerUsername) finalPartnerUsername = `${uniqueUsername}-${randomUUID().split('-')[0]}`;

        const newFoodPartner = await FoodPartnermodel.create({
            name,
            username: finalPartnerUsername,
            contactName,
            phone,
            email: emailNorm,
            password: hashedPassword,
            profilePhoto: profilePhotoUrl,
            restaurantName,
            address
        });

        const token = jwt.sign({ id: newFoodPartner._id }, process.env.jwt_secret, { expiresIn: '1h' });
        setAuthCookie(res, token);
        res.status(201).json({ message: 'Food Partner registered successfully', token, foodPartner: {
            id: newFoodPartner._id,
            name: newFoodPartner.name,
            contactName: newFoodPartner.contactName,
            email: newFoodPartner.email,
            profilePhoto: newFoodPartner.profilePhoto,
            restaurantName: newFoodPartner.restaurantName,
            address: newFoodPartner.address,
            phone: newFoodPartner.phone,
        } });
    } catch (error) {
        console.error('[registerFoodPartner] error:', error);
        // If duplicate key error from mongoose unique indexes, return friendly message
        if (error && error.code === 11000) {
            const dupField = Object.keys(error.keyValue || {}).join(', ');
            return res.status(400).json({ message: `Duplicate value for field(s): ${dupField}` });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function loginFoodPartner(req, res) {
    const { email, password } = req.body;
    try {
        const foodPartner = await FoodPartnermodel.findOne({ email });
        if (!foodPartner) {
            return res.status(404).json({ message: 'Food Partner or  email not found' });
        }
        const isMatch = await bcrypt.compare(password, foodPartner.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: foodPartner._id }, process.env.jwt_secret, { expiresIn: '1h' });
        setAuthCookie(res, token);
        res.status(200).json({ message: 'Login successful', token, foodPartner: {
            id: foodPartner._id,
            name: foodPartner.name,
            username: foodPartner.username,
            email: foodPartner.email,
            profilePhoto: foodPartner.profilePhoto,
            restaurantName: foodPartner.restaurantName,
            address: foodPartner.address,
            phoneNumber: foodPartner.phoneNumber,
        } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
function logoutFoodPartner(req, res) {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logout successful' });
}   

async function updateCurrentFoodPartner(req, res) {
    if (!req.foodPartner) {
        return res.status(401).json({ message: 'please login first' });
    }

    try {
        let nextProfilePhoto = req.foodPartner.profilePhoto || '';

        if (req.body.removeProfilePhoto === 'true') {
            nextProfilePhoto = '';
        }

        if (req.file) {
            if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({ message: 'Profile photo must be an image file' });
            }

            const uploadResult = await storageService.uploadFile(req.file.buffer, randomUUID());
            nextProfilePhoto = uploadResult.url;
        }

        req.foodPartner.profilePhoto = nextProfilePhoto;
        await req.foodPartner.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            foodPartner: {
                id: req.foodPartner._id,
                name: req.foodPartner.name,
                username: req.foodPartner.username,
                contactName: req.foodPartner.contactName,
                email: req.foodPartner.email,
                profilePhoto: req.foodPartner.profilePhoto,
                restaurantName: req.foodPartner.restaurantName,
                address: req.foodPartner.address,
                phone: req.foodPartner.phone,
            },
        });
    } catch (error) {
        console.error('[updateCurrentFoodPartner] error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = { registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateCurrentUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    updateCurrentFoodPartner,
};


