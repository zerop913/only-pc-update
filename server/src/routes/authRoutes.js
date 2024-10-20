const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Имя пользователя должно содержать минимум 3 символа"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Пароль должен содержать минимум 6 символов"),
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Имя пользователя обязательно"),
    body("password").notEmpty().withMessage("Пароль обязателен"),
  ],
  authController.login
);

router.post("/profile", auth, userController.createProfile);
router.put("/profile", auth, userController.updateProfile);
router.get("/profile", auth, userController.getProfile);
router.delete("/profile", auth, userController.deleteProfile);

module.exports = router;
