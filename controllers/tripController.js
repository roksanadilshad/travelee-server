const { connectDB } = require("../config/db");


const getAllTrips = async (req, res) => {
  try {
    const db = await connectDB();
   
    const trips = await db.collection("mytrips").find().toArray();
    
    return res.status(200).json({
      success: true,
      data: trips,
      total: trips.length 
    });
  } catch (error) {
    console.error("Get Trips Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllTrips
};