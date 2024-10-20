const {
  Product,
  Category,
  Characteristic,
  ProductCharacteristic,
} = require("../models");

const productController = {
  getProductsByCategory: async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const products = await Product.findAll({
        where: { category_id: categoryId },
        include: [
          {
            model: Characteristic,
            through: { model: ProductCharacteristic, attributes: ["value"] },
          },
        ],
      });

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
      res
        .status(500)
        .json({ message: "Error fetching products", error: error.message });
    }
  },
  getProductBySlug: async (req, res) => {
    try {
      const { categories, childCategories, slug } = req.params;

      let categoryPath = categories;
      if (childCategories) {
        categoryPath += "/" + childCategories;
      }

      console.log(`Поиск товара: категория=${categoryPath}, slug=${slug}`);

      const product = await Product.findOne({
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
      });

      if (!product) {
        console.log(`Товар не найден: категория=${categoryPath}, slug=${slug}`);
        return res.status(404).json({ message: "Товар не найден" });
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
      console.error("Ошибка при получении товара:", error);
      res.status(500).json({
        message: "Ошибка при получении товара",
        error: error.message,
      });
    }
  },
};

module.exports = productController;
