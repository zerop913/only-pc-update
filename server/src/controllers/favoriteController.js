const {
  Favorite,
  Product,
  Characteristic,
  ProductCharacteristic,
} = require("../models");
const { Op } = require("sequelize");

const favoriteController = {
  addToFavorites: async (req, res) => {
    try {
      const userId = req.userData.userId;
      const { productId } = req.body;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: "Товар не найден" });
      }

      const [favorite, created] = await Favorite.findOrCreate({
        where: { user_id: userId, product_id: productId },
        defaults: { user_id: userId, product_id: productId },
      });

      if (created) {
        return res.status(201).json({ message: "Товар добавлен в избранное" });
      } else {
        return res.status(200).json({ message: "Товар уже в избранном" });
      }
    } catch (error) {
      console.error("Ошибка при добавлении в избранное:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  },

  removeFromFavorites: async (req, res) => {
    try {
      const userId = req.userData.userId;
      const { productId } = req.body;

      const result = await Favorite.destroy({
        where: { user_id: userId, product_id: productId },
      });

      if (result) {
        return res.json({ message: "Товар удален из избранного" });
      } else {
        return res.status(404).json({ message: "Товар не найден в избранном" });
      }
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  },

  getFavorites: async (req, res) => {
    try {
      const userId = req.userData.userId;
      console.log("Запрос избранных для userId:", userId);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      // console.log("Параметры запроса:", { page, limit, offset });

      const { count, rows: favorites } = await Favorite.findAndCountAll({
        where: {
          user_id: userId,
        },
        include: [
          {
            model: Product,
            required: true,
          },
        ],
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });

      // console.log("Найдено избранных:", count);
      // console.log(
      //   "Список избранных:",
      //   favorites.map((f) => f.toJSON())
      // );

      const formattedProducts = favorites.map((favorite) => {
        const product = favorite.Product;
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          slug: product.slug,
        };
      });

      // console.log("Сформированные продукты:", formattedProducts);

      res.json({
        products: formattedProducts,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Полная ошибка при получении избранных:", error);
      res.status(500).json({
        message: "Ошибка сервера",
        errorDetails: error.message,
        stack: error.stack,
      });
    }
  },

  checkFavoriteStatus: async (req, res) => {
    try {
      const userId = req.userData.userId;
      const productIds = req.body.productIds;

      const favorites = await Favorite.findAll({
        where: {
          user_id: userId,
          product_id: { [Op.in]: productIds },
        },
        attributes: ["product_id"],
      });

      const favoriteProductIds = favorites.map((f) => f.product_id);

      res.json({ favoriteProductIds });
    } catch (error) {
      console.error("Ошибка при проверке статуса избранного:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  },
};

module.exports = favoriteController;
