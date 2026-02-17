const { getDB } = require("../config/db");

const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.decoded_email;
    const db = getDB();
    const user = await db.collection("users").findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(403).send({ message: "Admin access only" });
    }

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports=verifyAdmin;
