const {
  Product,
  Category,
  Characteristic,
  ProductCharacteristic,
} = require("../models");

const handleError = (error, operation) => {
  console.error(`Ошибка в ${operation}:`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
  });

  if (error.name === "SequelizeConnectionError") {
    return {
      status: 503,
      message: "База данных временно недоступна. Пожалуйста, попробуйте позже.",
    };
  }

  if (error.name === "SequelizeTimeoutError") {
    return {
      status: 504,
      message: "Превышено время ожидания ответа. Пожалуйста, попробуйте позже.",
    };
  }

  return {
    status: 500,
    message: "Произошла внутренняя ошибка сервера.",
  };
};

const productController = {
  getProductsByCategory: async (req, res) => {
    try {
      const categoryId = req.params.categoryId;

      // Добавляем таймаут для запроса
      const products = await Promise.race([
        Product.findAll({
          where: { category_id: categoryId },
          include: [
            {
              model: Characteristic,
              through: { model: ProductCharacteristic, attributes: ["value"] },
            },
          ],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database Timeout")), 5000)
        ),
      ]);

      const formattedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        slug: product.slug,
        characteristics: product.Characteristics.map((characteristic) => ({
          name: characteristic.name,
          value: characteristic.ProductCharacteristic.value,
        })),
      }));

      res.json(formattedProducts);
    } catch (error) {
      const { status, message } = handleError(error, "getProductsByCategory");
      res.status(status).json({ message, error: error.message });
    }
  },

  getProductBySlug: async (req, res) => {
    try {
      const { categories, childCategories, slug } = req.params;

      let categoryPath = categories;
      if (childCategories) {
        categoryPath += "/" + childCategories;
      }

      // Добавляем таймаут для запроса
      const product = await Promise.race([
        Product.findOne({
          where: { slug },
          include: [
            {
              model: Category,
              where: { short_name: categoryPath.split("/").pop() },
            },
            {
              model: Characteristic,
              through: { model: ProductCharacteristic, attributes: ["value"] },
            },
          ],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database Timeout")), 5000)
        ),
      ]);

      if (!product) {
        return res.status(404).json({
          message: "Товар не найден",
          details: {
            categoryPath,
            slug,
          },
        });
      }

      const formattedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        slug: product.slug,
        characteristics: product.Characteristics.map((char) => ({
          name: char.name,
          value: char.ProductCharacteristic.value,
        })),
        category: {
          id: product.Category.id,
          name: product.Category.name,
          short_name: product.Category.short_name,
        },
      };

      res.json(formattedProduct);
    } catch (error) {
      const { status, message } = handleError(error, "getProductBySlug");
      res.status(status).json({ message, error: error.message });
    }
  },
};

module.exports = productController;
