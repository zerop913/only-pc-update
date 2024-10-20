const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:categories/:slug", productController.getProductBySlug);
router.get(
  "/:categories/:childCategories/:slug",
  productController.getProductBySlug
);

module.exports = router;
