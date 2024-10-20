const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { userId: decodedToken.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Аутентификация не удалась" });
  }
};
