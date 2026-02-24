const { getDB } = require('../config/db');
const collections = require('../constants/collections');


const getReviews = async (req, res) => {
  try {
    const db = getDB();
    // Use the constant here
    const reviews = await db.collection(collections.tripreviews)
      .find()
      .sort({ date: -1 })
      .toArray();
    res.status(200).send(reviews);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const addReview = async (req, res) => {
  try {
    const review = req.body;
    const db = getDB();
    const result = await db.collection(collections.tripreviews).insertOne(review);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to post review" });
  }
};

module.exports = { getReviews, addReview };