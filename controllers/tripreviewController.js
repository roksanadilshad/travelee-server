const { getDB, connectDB } = require("../config/db");
const { tripreviews } = require("../constants/collections");
const { ObjectId } = require("mongodb");

//  ADD Trip Review  
const addTripReview = async (req, res) => {
  try {
    
   const { userEmail, userName, userAvatar, destination_id, rating, comment, images } = req.body;

if (!userEmail || !userName || !destination_id || !rating || !comment) {
  return res.status(400).json({ message: "Missing required fields" });
}

const reviewDoc = {
  user: {
    email: userEmail,
    name: userName,
    avatar: userAvatar || "",
  },
  destination_id,
  rating,
  comment,
  images: images || [],
  createdAt: new Date(),
  verified: true,
};

    const db = await connectDB();
    const result = await db.collection(tripreviews).insertOne(reviewDoc);

    res.status(201).json({ message: "Trip review added successfully" });
  } catch (error) {
    console.error("Error adding trip review:", error);
    res.status(500).json({ message: "Failed to add trip review" });
  }
};
 
// GET Trip Reviews (by destination_id)
const getTripReviews = async (req, res) => {
  try {
    const db = await connectDB();
 
    const { destination_id } = req.query;

 
    const query = destination_id ? { destination_id } : {};

 
    const reviews = await db
      .collection(tripreviews)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching trip reviews:", error);
    res.status(500).json({ message: "Failed to fetch trip reviews" });
  }
};

module.exports = { addTripReview, getTripReviews };