const jwt = require("jsonwebtoken");
const { User, UserInfo } = require("../models");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email } = req.body;

    // Проверяем существование пользователя до создания
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким именем уже существует" });
    }

    // Создаем пользователя
    const user = await User.create({ username, password });

    // Создаем профиль пользователя с корректными данными
    await UserInfo.create({
      user_id: user.id,
      email: email,
      username: username,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: email,
      },
    });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
      include: [{ model: UserInfo }], // Добавляем связанные данные профиля
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Неверное имя пользователя или пароль" });
    }

    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Неверное имя пользователя или пароль" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Вход выполнен успешно",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.UserInfo?.email,
      },
    });
  } catch (error) {
    console.error("Ошибка при входе:", error);
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
};
