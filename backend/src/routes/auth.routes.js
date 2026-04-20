const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/user/register', upload.single('profilePhoto'), authController.registerUser);
router.post('/user/login', authController.loginUser);
router.get('/user/logout', authController.logoutUser);
router.get('/user/me', authMiddleware.authUserMiddleware, authController.getCurrentUser);
router.put('/user/me', authMiddleware.authUserMiddleware, upload.single('profilePhoto'), authController.updateCurrentUser);


// Food Partner routes
// support hyphenated routes to match frontend paths (/food-partner/...)
router.post('/food-partner/register', upload.single('profilePhoto'), authController.registerFoodPartner);
router.post('/food-partner/login', authController.loginFoodPartner);
router.get('/food-partner/logout', authController.logoutFoodPartner);

// legacy (non-hyphen) routes kept for compatibility
router.post('/foodpartner/register', upload.single('profilePhoto'), authController.registerFoodPartner);
router.post('/foodpartner/login', authController.loginFoodPartner);
router.get('/foodpartner/logout', authController.logoutFoodPartner);






module.exports = router;