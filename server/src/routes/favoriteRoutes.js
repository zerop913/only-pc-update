const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const auth = require("../middleware/auth");

router.post("/add", auth, favoriteController.addToFavorites);
router.post("/remove", auth, favoriteController.removeFromFavorites);
router.get("/", auth, favoriteController.getFavorites);
router.post("/check-status", auth, favoriteController.checkFavoriteStatus);

module.exports = router;
