const { getDB } = require("../config/db");
const { tripreviews } = require("../constants/collections");
const { ObjectId } = require("mongodb");

//  ADD Trip Review  
const addTripReview = async (req, res) => {
  try {
    const { userId, userName, userAvatar, tripId, rating, comment, images } = req.body;

    // Validate required fields
    if (!userId || !userName || !tripId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ObjectId validation
    if (!ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const reviewDoc = {
      user: {
        id: userId,
        name: userName,
        avatar: userAvatar || "",
      },
      tripId: new ObjectId(tripId),
      rating,
      comment,
      images: images || [],
      createdAt: new Date(),
      verified: true,
    };

    const db = getDB();
    const result = await db.collection(tripreviews).insertOne(reviewDoc);

    res.status(201).json({
      message: "Trip review added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding trip review:", error);
    res.status(500).json({ message: "Failed to add trip review" });
  }
};

//  GET Trip Reviews 
const getTripReviews = async (req, res) => {
  try {
    const db = getDB();
    const { tripId } = req.query;

    const query = tripId && ObjectId.isValid(tripId)
      ? { tripId: new ObjectId(tripId) }
      : {};

    const reviews = await db.collection(tripreviews)
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
