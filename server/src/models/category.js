module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      name: DataTypes.STRING,
      russian_name: DataTypes.STRING,
      image: DataTypes.STRING,
      short_name: DataTypes.STRING,
      parent_id: DataTypes.INTEGER,
    },
    {
      tableName: "categories",
      timestamps: false,
    }
  );

  Category.associate = function (models) {
    Category.hasMany(models.Category, {
      as: "children",
      foreignKey: "parent_id",
    });
    Category.belongsTo(models.Category, {
      as: "parent",
      foreignKey: "parent_id",
    });
    Category.hasMany(models.Product, { foreignKey: "category_id" });
  };

  return Category;
};
