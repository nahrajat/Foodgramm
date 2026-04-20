const express = require('express');
const foodPartnerController = require("../controllers/foodpartner.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require('../controllers/auth.controller');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.get("/me",
    authMiddleware.authFoodPartnerMiddleware,
    foodPartnerController.getCurrentFoodPartner)

router.put("/me",
    authMiddleware.authFoodPartnerMiddleware,
    upload.single('profilePhoto'),
    authController.updateCurrentFoodPartner)

/* /api/food-partner/:id */
router.get("/:id", foodPartnerController.getFoodPartnerById)

module.exports = router;