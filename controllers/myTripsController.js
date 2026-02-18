const { getDB } = require("../config/db");
const { mytrips } = require("../constants/collections");
const { ObjectId } = require("mongodb");

// GET My Trips (optionally by user)
const getMyTrips = async (req, res) => {
  try {
    const db = getDB();
    const { userId } = req.query;  

    const query = userId ? { userId } : {};

    const trips = await db.collection(mytrips).find(query).toArray();

    const formattedTrips = trips.map((trip) => ({
      _id: trip._id,
      tripName: trip.tripName,
      destination: trip.destination,
      durationDays: trip.durationDays,
      startDate: trip.startDate,
      endDate: trip.endDate,
      activities: trip.activities,
      image: trip.image,
      createdAt: trip.createdAt,
    }));

    res.status(200).json(formattedTrips);
  } catch (err) {
    console.error("Error fetching My Trips:", err);
    res.status(500).json({ message: "Failed to fetch My Trips" });
  }
};

// DELETE My Trip
const deleteMyTrip = async (req, res) => {
  try {
    const db = getDB();
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

module.exports = { getMyTrips, deleteMyTrip };
