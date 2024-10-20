"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductCharacteristic extends Model {
    static associate(models) {
      ProductCharacteristic.belongsTo(models.Product, {
        foreignKey: "product_id",
      });
      ProductCharacteristic.belongsTo(models.Characteristic, {
        foreignKey: "characteristic_id",
      });
    }
  }
  ProductCharacteristic.init(
    {
      product_id: DataTypes.INTEGER,
      characteristic_id: DataTypes.INTEGER,
      value: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ProductCharacteristic",
      tableName: "productcharacteristics",
      timestamps: false,
    }
  );
  return ProductCharacteristic;
};
