"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Characteristic extends Model {
    static associate(models) {
      Characteristic.belongsToMany(models.Product, {
        through: models.ProductCharacteristic,
        foreignKey: "characteristic_id",
      });
      Characteristic.hasMany(models.ProductCharacteristic, {
        foreignKey: "characteristic_id",
      });
    }
  }
  Characteristic.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Characteristic",
      tableName: "characteristics",
      timestamps: false,
    }
  );
  return Characteristic;
};
