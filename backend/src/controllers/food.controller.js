const foodModel = require('../models/food.models');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.models")
const saveModel = require("../models/save.models")
const { v4: uuid } = require("uuid")

function normalizeRedirectLink(link) {
    if (!link || typeof link !== "string") return "";
    const trimmed = link.trim();
    if (!trimmed) return "";
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(candidate);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }
        return parsed.toString();
    } catch (error) {
        return null;
    }
}


async function createFood(req, res) {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())
    const redirectLink = normalizeRedirectLink(req.body.redirectLink);

    if (req.body.redirectLink && !redirectLink) {
        return res.status(400).json({
            message: "Please provide a valid direct link"
        });
    }

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        redirectLink,
        foodPartner: req.foodPartner._id
    })

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })

}

async function updateFood(req, res) {
    const { id } = req.params;
    const foodItem = await foodModel.findById(id);

    if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
    }

    if (String(foodItem.foodPartner) !== String(req.foodPartner._id)) {
        return res.status(403).json({ message: "You can only edit your own food items" });
    }

    const nextRedirectLink = Object.prototype.hasOwnProperty.call(req.body, 'redirectLink')
        ? normalizeRedirectLink(req.body.redirectLink)
        : foodItem.redirectLink;

    if (Object.prototype.hasOwnProperty.call(req.body, 'redirectLink') && req.body.redirectLink && !nextRedirectLink) {
        return res.status(400).json({ message: "Please provide a valid direct link" });
    }

    const nextVideo = req.file
        ? (await storageService.uploadFile(req.file.buffer, uuid())).url
        : foodItem.video;

    foodItem.name = req.body.name ?? foodItem.name;
    foodItem.description = req.body.description ?? foodItem.description;
    foodItem.redirectLink = nextRedirectLink;
    foodItem.video = nextVideo;

    await foodItem.save();

    res.status(200).json({
        message: "food updated successfully",
        food: foodItem
    });
}

async function deleteFood(req, res) {
    const { id } = req.params;
    const foodItem = await foodModel.findById(id);

    if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
    }

    if (String(foodItem.foodPartner) !== String(req.foodPartner._id)) {
        return res.status(403).json({ message: "You can only delete your own food items" });
    }

    await likeModel.deleteMany({ food: id });
    await saveModel.deleteMany({ food: id });
    await foodModel.findByIdAndDelete(id);

    res.status(200).json({
        message: "food deleted successfully"
    });
}

async function getFoodItems(req, res) {
    const foodItems = await foodModel.find({})
    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems
    })
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully"
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like
    })

}

async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        })

        return res.status(200).json({
            message: "Food unsaved successfully"
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save
    })

}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(404).json({ message: "No saved foods found" });
    }

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods
    });

}


module.exports = {
    createFood,
    updateFood,
    deleteFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood
}