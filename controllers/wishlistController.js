const { connectDB } = require("../config/db");
const { wishlists } = require("../constants/collections");

const addToWishlist = async (req, res) => {
  try {
    const db = await connectDB();
    const data = req.body;

    const exists = await db.collection(wishlists).findOne({
      destination_id: data.destination_id,
      userEmail: data.userEmail,
    });

    if (exists) {
      return res.status(200).send({ message: "Already in wishlist" });
    }

    const result = await db.collection(wishlists).insertOne({
      ...data,
      createdAt: new Date(),
    });

    res.send({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { destination_id, userEmail } = req.body;
    const db = await connectDB();

    const result = await db.collection(wishlists).deleteOne({
      destination_id,
      userEmail,
    });

    res.send({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
};

const getUserWishlist = async (req, res) => {
  try {
    const { email } = req.params;
    const db = await connectDB();

    const data = await db
      .collection(wishlists)
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
};

module.exports = { addToWishlist, removeFromWishlist, getUserWishlist };