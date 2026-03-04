const { connectDB } = require("../config/db");
const { users, itineraries } = require("../constants/collections");

const getAdminAnalytics = async (req, res) => {
  try {
    const db = await connectDB();

    const totalUsers = await db.collection(users).countDocuments();
    const totalItineraries = await db.collection(itineraries).countDocuments();
    const revenue = await db.collection("payments").aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray();
    const totalRevenue = revenue[0]?.total || 0;

    res.send({totalUsers,totalItineraries,totalRevenue});
  } catch (error) {
    res.status(500).send({ message: "Server Error" });
  }
};

module.exports = { getAdminAnalytics };