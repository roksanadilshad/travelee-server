const {getDB} =require('../config/db');
const { ObjectId } = require("mongodb");
const { itineraries } = require('../constants/collections');

const createItinerary = async (req, res) => {
  try {
    const db = getDB();
    const tripData = req.body;

    // 1. Basic Validation
    if (!tripData.destination || tripData.days.length === 0) {
      return res.status(400).send({ message: "Trip must have a destination and at least one day." });
    }

    // 2. Insert into MongoDB
    const result = await db
      .collection("itineraries").insertOne({
      ...tripData,
      status: 'saved',
      updatedAt: new Date()
    });

    res.status(201).send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}

const getUserItineraries = async (req, res) => {
  try {
    const email = req.params.email;
    const db = getDB();

    const result = await db
      .collection("itineraries")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch itineraries" });
  }
};


const deleteItinerary = async (req, res) => {
  try {
    const db = getDB();
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
  const db = getDB()
  const { itineraryId, activityId } = req.params;

  const result = await db.collection("itineraries").updateOne(
    { _id: new ObjectId(itineraryId) },
    {
      $pull: {
        "days.$[].activities": {
          id: Number(activityId), // string id
        },
      },
    }
  );

  res.send({ success: true });
};


module.exports = { createItinerary, getUserItineraries , deleteItinerary, deleteActivity};
