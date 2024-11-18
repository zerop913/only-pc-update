const {
  Product,
  Category,
  Characteristic,
  ProductCharacteristic,
  sequelize,
} = require("../models");
const NodeCache = require("node-cache");
const { Op } = require("sequelize");

const filterCache = new NodeCache({ stdTTL: 3600, checkperiod: 7200 });

exports.getCategoryFilters = async (req, res) => {
  try {
    const { category_name, subcategory_name } = req.params;

    const cacheKey = subcategory_name
      ? `filters_${category_name}_${subcategory_name}`
      : `filters_${category_name}`;

    const cachedFilters = filterCache.get(cacheKey);
    if (cachedFilters) {
      return res.json(cachedFilters);
    }

    let category;
    if (subcategory_name) {
      const parentCategory = await Category.findOne({
        where: { short_name: category_name },
      });

      if (!parentCategory) {
        return res
          .status(404)
          .json({ message: "Родительская категория не найдена" });
      }

      category = await Category.findOne({
        where: {
          short_name: subcategory_name,
          parent_id: parentCategory.id,
        },
      });

      if (!category) {
        return res
          .status(404)
          .json({ message: "Дочерняя категория не найдена" });
      }
    } else {
      category = await Category.findOne({
        where: { short_name: category_name },
      });

      if (!category) {
        return res.status(404).json({ message: "Категория не найдена" });
      }
    }

    const categoryId = category.id;

    const filters = await Characteristic.findAll({
      attributes: [
        "id",
        "name",
        [
          sequelize.fn(
            "array_agg",
            sequelize.fn(
              "DISTINCT",
              sequelize.col("ProductCharacteristics.value")
            )
          ),
          "values",
        ],
      ],
      include: [
        {
          model: ProductCharacteristic,
          attributes: [],
          include: [
            {
              model: Product,
              where: { category_id: categoryId },
              attributes: [],
            },
          ],
        },
      ],
      group: ["Characteristic.id", "Characteristic.name"],
      having: sequelize.where(
        sequelize.fn(
          "array_length",
          sequelize.fn(
            "array_agg",
            sequelize.fn(
              "DISTINCT",
              sequelize.col("ProductCharacteristics.value")
            )
          ),
          1
        ),
        ">",
        1
      ),
    });

    const formattedFilters = filters.map((filter) => ({
      id: filter.id,
      name: filter.name,
      values: filter.getDataValue("values").sort((a, b) => {
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.localeCompare(b, "ru", { numeric: true });
      }),
    }));

    const priceRange = await Product.findAll({
      attributes: [
        [sequelize.fn("MIN", sequelize.col("price")), "minPrice"],
        [sequelize.fn("MAX", sequelize.col("price")), "maxPrice"],
      ],
      where: { category_id: categoryId },
    });

    const { minPrice, maxPrice } = priceRange[0].dataValues;
    const priceFilter = {
      id: "price",
      name: "Цена",
      min: parseFloat(minPrice),
      max: parseFloat(maxPrice),
    };

    formattedFilters.unshift(priceFilter);

    filterCache.set(cacheKey, formattedFilters);

    res.json(formattedFilters);
  } catch (error) {
    console.error("Error in getCategoryFilters:", error);
    res.status(500).json({ message: "Ошибка сервера при получении фильтров" });
  }
};

exports.getFilteredProducts = async (req, res) => {
  try {
    const { category_name, subcategory_name } = req.params;
    const filters = req.body;

    let category;
    if (subcategory_name) {
      const parentCategory = await Category.findOne({
        where: { short_name: category_name },
      });

      if (!parentCategory) {
        return res
          .status(404)
          .json({ message: "Родительская категория не найдена" });
      }

      category = await Category.findOne({
        where: {
          short_name: subcategory_name,
          parent_id: parentCategory.id,
        },
      });

      if (!category) {
        return res
          .status(404)
          .json({ message: "Дочерняя категория не найдена" });
      }
    } else {
      category = await Category.findOne({
        where: { short_name: category_name },
      });

      if (!category) {
        return res.status(404).json({ message: "Категория не найдена" });
      }
    }

    const categoryId = category.id;

    let whereClause = { category_id: categoryId };
    let includeClause = [];

    if (filters.price) {
      whereClause.price = {
        [Op.between]: [filters.price.min, filters.price.max],
      };
    }

    for (const [characteristicId, values] of Object.entries(filters)) {
      if (characteristicId !== "price") {
        includeClause.push({
          model: ProductCharacteristic,
          where: {
            characteristic_id: characteristicId,
            value: { [Op.in]: values },
          },
        });
      }
    }

    const products = await Product.findAll({
      where: whereClause,
      include: includeClause,
    });

    res.json(products);
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    res
      .status(500)
      .json({ message: "Ошибка сервера при фильтрации продуктов" });
  }
};
