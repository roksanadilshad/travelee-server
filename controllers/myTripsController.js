const { getDB, connectDB } = require("../config/db");
const { mytrips } = require("../constants/collections");
const { ObjectId } = require("mongodb");

const getMyTrips = async (req, res) => {
  try {
    const db = await connectDB();

    const userEmail = req.user.email;

    if (!userEmail)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const trips = await db
      .collection(mytrips)
      .find({
        $or: [
          { userEmail: userEmail },
          {
            members: {
              $elemMatch: { email: userEmail, status: "accepted" },
            },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (err) {
    console.error("Get My Trips Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// add new trip
const addToMyTrips = async (req, res) => {
  try {
    const db = await connectDB();
    const tripData = req.body;
    const userEmail = req.user.email;

    const exists = await db.collection(mytrips).findOne({
      destination_id: tripData.destination_id,
      userEmail: userEmail,
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: "Trip already exists in your list" });
    }

    const result = await db.collection(mytrips).insertOne({
      ...tripData,
      userEmail: userEmail,
      members: [],
      status: tripData.status || "pending",
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Trip added successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    console.error("Error adding to My Trips:", err);
    res.status(500).json({ message: "Failed to add to My Trips" });
  }
};

// delete
const deleteMyTrip = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const userEmail = req.user.email;

    const result = await db.collection(mytrips).deleteOne({
      _id: new ObjectId(id),
      userEmail: userEmail,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Trip not found or unauthorized" });
    }

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error("Error deleting My Trip:", err);
    res.status(500).json({ message: "Failed to delete My Trip" });
  }
};

module.exports = { getMyTrips, deleteMyTrip, addToMyTrips };
