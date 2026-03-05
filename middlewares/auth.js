const jwt = require("jsonwebtoken");
const app_secret = process.env.JWT_SECRET;
module.exports = (req, res, next) => {
  // next();
  if (!req.header("auth-token")) {
    return res.status(401).json({
      error: true,
      message: "user not Unauthorized.",
    });
  }
  let token = req.header("auth-token");
  jwt.verify(token, app_secret, (err, userInfo) => {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "user not unauthorized.",
      });
    } else {
      req.user = userInfo;
      next();
    }
  });
};
