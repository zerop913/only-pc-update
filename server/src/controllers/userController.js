const { User, UserInfo } = require("../models");

exports.createProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, dateOfBirth } = req.body;
    const userId = req.userData.userId;

    const userInfo = await UserInfo.create({
      user_id: userId,
      firstName,
      lastName,
      phone,
      email,
      dateOfBirth,
    });

    res.status(201).json({ message: "Профиль успешно создан", userInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при создании профиля" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, dateOfBirth } = req.body;
    const userId = req.userData.userId;

    const userInfo = await UserInfo.findOne({ where: { user_id: userId } });

    if (!userInfo) {
      return res
        .status(404)
        .json({ message: "Профиль пользователя не найден" });
    }

    await userInfo.update({
      firstName,
      lastName,
      phone,
      email,
      dateOfBirth,
    });

    res.json({ message: "Профиль успешно обновлен", userInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при обновлении профиля" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const userInfo = await UserInfo.findOne({ where: { user_id: userId } });

    if (!userInfo) {
      return res
        .status(404)
        .json({ message: "Профиль пользователя не найден" });
    }

    res.json(userInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при получении профиля" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    await UserInfo.destroy({ where: { user_id: userId } });
    await user.destroy();

    res.json({ message: "Профиль пользователя успешно удален" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при удалении профиля" });
  }
};
