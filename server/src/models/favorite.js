"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    static associate(models) {
      Favorite.belongsTo(models.User, { foreignKey: "user_id" });
      Favorite.belongsTo(models.Product, { foreignKey: "product_id" });
    }
  }

  Favorite.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Favorite",
      tableName: "favorites",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "product_id"],
        },
      ],
    }
  );

  return Favorite;
};
