const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserInfo = sequelize.define(
    "UserInfo",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      firstName: {
        type: DataTypes.STRING(255),
      },
      lastName: {
        type: DataTypes.STRING(255),
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      email: {
        type: DataTypes.STRING(255),
      },
      dateOfBirth: {
        type: DataTypes.DATE,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "userinfo",
      timestamps: false,
      underscored: true,
    }
  );

  UserInfo.associate = function (models) {
    UserInfo.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return UserInfo;
};
