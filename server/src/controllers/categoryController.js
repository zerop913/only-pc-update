const {
  Category,
  Product,
  Characteristic,
  ProductCharacteristic,
} = require("../models");

const categoryController = {
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({
        where: { parent_id: null },
        attributes: ["id", "name", "russian_name", "image", "short_name"],
        include: [
          {
            model: Category,
            as: "children",
            attributes: ["id", "name", "russian_name", "short_name"],
          },
        ],
      });

      const formattedCategories = categories.map((category) => {
        const formattedCategory = category.toJSON();
        if (formattedCategory.children.length === 0) {
          delete formattedCategory.children;
        }
        return formattedCategory;
      });

      res.json(formattedCategories);
    } catch (error) {
      res.status(500).json({
        message: "Ошибка при получении категорий",
        error: error.message,
      });
    }
  },

  getCategoryByShortName: async (req, res) => {
    try {
      const shortName = req.params.categoryShortName;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      console.log(
        `Запрос категории: ${shortName}, страница: ${page}, лимит: ${limit}`
      );

      const category = await Category.findOne({
        where: { short_name: shortName },
        attributes: [
          "id",
          "name",
          "russian_name",
          "image",
          "short_name",
          "parent_id",
        ],
        include: [
          {
            model: Category,
            as: "children",
            attributes: ["id", "name", "russian_name", "short_name", "image"],
          },
        ],
      });

      if (!category) {
        console.log(`Категория не найдена: ${shortName}`);
        return res.status(404).json({ message: "Категория не найдена" });
      }

      console.log(`Найдена категория: ${category.name}, ID: ${category.id}`);

      // Если у категории есть дочерние категории
      if (category.children && category.children.length > 0) {
        console.log(`Обработка подкатегорий для ${category.name}`);

        const { count, rows: childCategories } = await Category.findAndCountAll(
          {
            where: { parent_id: category.id },
            attributes: ["id", "name", "russian_name", "short_name", "image"],
            limit: limit,
            offset: offset,
          }
        );

        console.log(`Получено подкатегорий: ${childCategories.length}`);

        const categoriesWithProductCount = await Promise.all(
          childCategories.map(async (child) => {
            const productCount = await Product.count({
              where: { category_id: child.id },
            });
            return {
              ...child.toJSON(),
              productCount,
            };
          })
        );

        return res.json({
          category: {
            id: category.id,
            name: category.name,
            russian_name: category.russian_name,
            short_name: category.short_name,
            image: category.image,
          },
          categories: categoriesWithProductCount,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        });
      } else {
        // Существующая логика для товаров...
        const { count, rows: products } = await Product.findAndCountAll({
          where: { category_id: category.id },
          include: [
            {
              model: Characteristic,
              through: { model: ProductCharacteristic, attributes: ["value"] },
            },
          ],
          limit: limit,
          offset: offset,
          distinct: true,
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

        return res.json({
          category: {
            id: category.id,
            name: category.name,
            russian_name: category.russian_name,
            short_name: category.short_name,
            image: category.image,
          },
          products: formattedProducts,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        });
      }
    } catch (error) {
      console.error("Ошибка при получении категории или товаров:", error);
      res.status(500).json({
        message: "Ошибка при получении категории или товаров",
        error: error.message,
      });
    }
  },

  getProductOrSubcategory: async (req, res) => {
    try {
      const parentShortName = req.params.categoryShortName;
      const productIdOrSubcategory = req.params.productIdOrSubcategory;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      console.log(
        `Запрос: родительская категория ${parentShortName}, продукт/подкатегория ${productIdOrSubcategory}`
      );

      const parentCategory = await Category.findOne({
        where: { short_name: parentShortName },
      });

      if (!parentCategory) {
        console.log(`Родительская категория не найдена: ${parentShortName}`);
        return res.status(404).json({ message: "Категория не найдена" });
      }

      const isProductId = !isNaN(productIdOrSubcategory);

      if (isProductId) {
        console.log(
          `Обработка запроса продукта с ID: ${productIdOrSubcategory}`
        );
        const product = await Product.findOne({
          where: {
            id: productIdOrSubcategory,
            category_id: parentCategory.id,
          },
          include: [
            {
              model: Characteristic,
              through: { model: ProductCharacteristic, attributes: ["value"] },
            },
          ],
        });

        if (!product) {
          console.log(`Товар не найден: ID ${productIdOrSubcategory}`);
          return res.status(404).json({ message: "Товар не найден" });
        }

        const formattedProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          slug: product.slug,
          characteristics: product.Characteristics.map((characteristic) => ({
            name: characteristic.name,
            value: characteristic.ProductCharacteristic.value,
          })),
        };

        console.log(`Отправка данных о продукте: ${product.name}`);
        res.json(formattedProduct);
      } else {
        console.log(
          `Обработка запроса подкатегории: ${productIdOrSubcategory}`
        );
        const subcategory = await Category.findOne({
          where: {
            short_name: productIdOrSubcategory,
            parent_id: parentCategory.id,
          },
        });

        if (!subcategory) {
          console.log(`Подкатегория не найдена: ${productIdOrSubcategory}`);
          return res.status(404).json({ message: "Подкатегория не найдена" });
        }

        const { count, rows: products } = await Product.findAndCountAll({
          where: { category_id: subcategory.id },
          include: [
            {
              model: Characteristic,
              through: { model: ProductCharacteristic, attributes: ["value"] },
            },
          ],
          attributes: ["id", "name", "price", "image_url", "slug"],
          limit: limit,
          offset: offset,
          distinct: true,
        });

        console.log(`Найдено товаров в подкатегории: ${count}`);

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

        console.log(
          `Отправка данных о товарах подкатегории: ${subcategory.name}`
        );
        res.json({
          category: {
            id: subcategory.id,
            name: subcategory.name,
            russian_name: subcategory.russian_name,
            short_name: subcategory.short_name,
            image: subcategory.image,
          },
          products: formattedProducts,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        });
      }
    } catch (error) {
      console.error("Ошибка при получении товара или подкатегории:", error);
      res.status(500).json({
        message: "Ошибка при получении товара или подкатегории",
        error: error.message,
      });
    }
  },

  getProductByNestedCategory: async (req, res) => {
    try {
      const parentShortName = req.params.parentCategoryShortName;
      const childShortName = req.params.childCategoryShortName;
      const productId = req.params.productId;

      const parentCategory = await Category.findOne({
        where: { short_name: parentShortName },
      });

      if (!parentCategory) {
        return res
          .status(404)
          .json({ message: "Родительская категория не найдена" });
      }

      const childCategory = await Category.findOne({
        where: {
          short_name: childShortName,
          parent_id: parentCategory.id,
        },
      });

      if (!childCategory) {
        return res
          .status(404)
          .json({ message: "Дочерняя категория не найдена" });
      }

      const product = await Product.findOne({
        where: {
          id: productId,
          category_id: childCategory.id,
        },
        include: [
          {
            model: Characteristic,
            through: { model: ProductCharacteristic, attributes: ["value"] },
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: "Товар не найден" });
      }

      const formattedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        slug: product.slug,
        characteristics: product.Characteristics.map((characteristic) => ({
          name: characteristic.name,
          value: characteristic.ProductCharacteristic.value,
        })),
      };

      res.json(formattedProduct);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Ошибка при получении товара", error: error.message });
    }
  },
};

module.exports = categoryController;
