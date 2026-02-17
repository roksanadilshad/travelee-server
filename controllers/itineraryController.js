const {getDB} =require('../config/db');
const { itineraries } = require('../constants/collections');

const createItinerary = async (req, res) => {
  try {
    const itinerary = req.body;

    if (!itinerary.userEmail || !itinerary.destination || !itinerary.startDate) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const newItinerary = {
      ...itinerary,
      createdAt: new Date(),
      status: 'upcoming'
    };

    const db = getDB();
    const result = await db.collection(itineraries).insertOne(newItinerary);

    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to create itinerary" });
  }
};

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

module.exports = { createItinerary, getUserItineraries };
