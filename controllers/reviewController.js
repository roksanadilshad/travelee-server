const { getDB } = require('../config/db');

const addReview = async (req, res) => {
  const review = req.body;
  const db = getDB();
  const result = await db.collection("reviews").insertOne(review);
  res.send(result);
};

module.exports = { addReview };
