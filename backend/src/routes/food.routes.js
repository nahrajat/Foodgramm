const express = require('express');
const foodController = require("../controllers/food.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router();
const multer = require('multer');


const upload = multer({
    storage: multer.memoryStorage(),
})


/* POST /api/food/ [protected]*/
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("videourl"),
    foodController.createFood)

router.put('/:id',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("videourl"),
    foodController.updateFood)

router.delete('/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteFood)


/* GET /api/food/ [protected] */
router.get("/",
    authMiddleware.authGeneralMiddleware,
    foodController.getFoodItems)


router.post('/like',
    authMiddleware.authGeneralMiddleware,
    foodController.likeFood)


router.post('/save',
    authMiddleware.authGeneralMiddleware,
    foodController.saveFood
)


router.get('/save',
    authMiddleware.authGeneralMiddleware,
    foodController.getSaveFood
)



module.exports = router