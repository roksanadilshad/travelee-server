const { getDB, connectDB } = require("../config/db");
const { mytrips } = require("../constants/collections");
const { ObjectId } = require("mongodb");

// 1. GET My Trips (Modified to handle User Email and Payment Status)
const getMyTrips = async (req, res) => {
  try {
    const db = await connectDB();
    const email = req.query.email || req.query.userEmail;

    if (!email) return res.status(400).json({ success: false });

    const trips = await db.collection(mytrips)
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    // Since we fixed the save format, we just return the trips directly
    res.status(200).json({
      success: true,
      data: trips 
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// 2. ADD to My Trips (This is called when they click "Plan" or "Book")
const addToMyTrips = async (req, res) => {
  try {
    const db = await connectDB();
    const tripData = req.body;

    if (!tripData.userEmail) {
      return res.status(400).json({ message: "User email required" });
    }

    // Check if this specific trip for this user already exists
    const exists = await db.collection(mytrips).findOne({
      destination_id: tripData.destination_id,
      userEmail: tripData.userEmail,
    });

    if (exists) {
      return res.status(409).json({ message: "Trip already exists in your list" });
    }

    const result = await db.collection(mytrips).insertOne({
      ...tripData,
      status: tripData.status || "pending", // Default to pending until Stripe clears
      createdAt: new Date(),
    });

    res.status(201).json({ 
      success: true, 
      message: "Trip added successfully", 
      insertedId: result.insertedId 
    });
  } catch (err) {
    console.error("Error adding to My Trips:", err);
    res.status(500).json({ message: "Failed to add to My Trips" });
  }
};

// DELETE My Trip
const deleteMyTrip = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    const result = await db.collection(mytrips).deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error("Error deleting My Trip:", err);
    res.status(500).json({ message: "Failed to delete My Trip" });
  }
};

module.exports = { getMyTrips, deleteMyTrip, addToMyTrips };
