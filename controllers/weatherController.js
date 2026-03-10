const { ObjectId } = require("mongodb");
const { connectDB } = require("../config/db");
const { getActivitySuggestion } = require("../services/activitySwapService");
const { getWeatherForecastPay } = require("../services/weatherServicePay");
const { mytrips } = require("../constants/collections");

const getTripWeatherPay = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const trip = await db.collection(mytrips).findOne({ _id: new ObjectId(id) });
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

    const daysCount = trip.duration || 5;

    const weatherSummary = await getWeatherForecastPay(trip.city, trip.startDate, daysCount);

    // Default activity (because no activities in your DB)
    const defaultActivity = "City Tour";

    const enhancedWeather = weatherSummary.slice(0, daysCount).map(day => {
      const activitySwap = getActivitySuggestion(day.tag, defaultActivity);
      return { ...day, activitySwap };
    });

    return res.status(200).json({
      success: true,
      tripId: id,
      city: trip.city,
      country: trip.country,
      startDate: trip.startDate,
      duration: daysCount,
      weatherSummary: enhancedWeather
    });

  } catch (error) {
    console.error("Weather Error:", error);
    res.status(500).json({ success: false, message: "Weather fetch failed" });
  }
};

module.exports = { getTripWeatherPay };