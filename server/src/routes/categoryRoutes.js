const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const filterController = require("../controllers/filterController");

// Маршруты для фильтров
router.get("/filter/:category_name", filterController.getCategoryFilters);
router.get(
  "/filter/:category_name/:subcategory_name",
  filterController.getCategoryFilters
);
router.post("/filter/:category_name", filterController.getFilteredProducts);
router.post(
  "/filter/:category_name/:subcategory_name",
  filterController.getFilteredProducts
);

// Остальные маршруты
router.get("/", categoryController.getAllCategories);
router.get("/:categoryShortName", categoryController.getCategoryByShortName);
router.get(
  "/:categoryShortName/:productIdOrSubcategory",
  categoryController.getProductOrSubcategory
);
router.get(
  "/:parentCategoryShortName/:childCategoryShortName/:productId",
  categoryController.getProductByNestedCategory
);

module.exports = router;
