const { getDB, connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const { itineraries } = require("../constants/collections");

const createItinerary = async (req, res) => {
  try {
    const db = await connectDB();
    const tripData = req.body;
<<<<<<< HEAD
    // console.log(tripData)

    // 1. Basic Validation

    // if (!tripData.destination || tripData.days.length === 0) {
    //   return res.status(400).send({ message: "Trip must have a destination and at least one day." });
    // }

    // 2. Insert into MongoDB
=======
>>>>>>> bf0e96c16c4a9d024f1ef2acdd65eace35bd3fe4
    const result = await db.collection(itineraries).insertOne({
      ...tripData,
      status: "saved",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// controllers/itineraryController.js

const getUserItineraries = async (req, res) => {
  try {
    const { email } = req.params; 
    const db = await connectDB();

    if (!email) {
      return res.status(400).send({ message: "User email is required" });
    }

    const result = await db
      .collection(itineraries) 
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).send({ message: "Failed to fetch your trips" });
  }
};


const getSingleItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    const result = await db.collection("itineraries").findOne({ _id: new ObjectId(id) });
    
    if (!result) return res.status(404).send({ message: "Not found" });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error fetching itinerary" });
  }
};



const deleteItinerary = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid itinerary ID",
      });
    }

    // Delete from DB
    const result = await db
      .collection("itineraries")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Itinerary not found",
      });
    }

    res.send({
      success: true,
      message: "Itinerary deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//delete activity
const deleteActivity = async (req, res) => {
  try {
    const db = await connectDB();
    const { itineraryId, activityId } = req.params;

    console.log("Deleting Activity:", { itineraryId, activityId }); // DEBUG

    if (!ObjectId.isValid(itineraryId)) {
      return res.status(400).send({ success: false, message: "Invalid Itinerary ID format" });
    }

    const result = await db.collection(itineraries).updateOne(
      { _id: new ObjectId(itineraryId) },
      {
        $pull: {
          "days.$[].activities": {
            id: Number(activityId), // Ensure this matches the data type in your DB
          },
        },
      },
    );

    if (result.modifiedCount === 0) {
        return res.status(404).send({ success: false, message: "No activity found to delete" });
    }

    res.send({ success: true });
  } catch (error) {
    console.error("Delete Activity Error:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// --- NEW CODE START ---
const updateItinerary = async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ID" });
    }

    const result = await db
      .collection("itineraries")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
      );

    res.send({ success: true, message: "Updated successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};
// --- NEW CODE END ---

module.exports = {
  createItinerary,
  getUserItineraries,
  deleteItinerary,
  deleteActivity,
  updateItinerary,
};
module.exports = {getSingleItinerary, createItinerary, getUserItineraries , deleteItinerary, deleteActivity};
