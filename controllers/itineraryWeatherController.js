const { ObjectId } = require("mongodb");
const { connectDB } = require("../config/db");
const { getWeatherForecast } = require("../services/weatherService");
const { getActivitySuggestion } = require("../services/activitySwapService");
const { mytrips, itineraries } = require("../constants/collections");

const getItineraryWeather = async (req, res) => {
  try {
    const { id } = req.params;
    const { refresh } = req.query;

    const db = await connectDB();
    const itinerary = await db
      .collection(itineraries)
      .findOne({ _id: new ObjectId(id) });

    if (!itinerary || !itinerary.destination || !itinerary.startDate) {
      return res.status(422).json({
        success: false,
        message: "Itinerary missing required fields: destination or startDate",
      });
    }

    if (itinerary.weatherSummary && !refresh) {
      return res.status(200).json({
        success: true,
        message: "Returning cached weather data",
        itineraryId: id,
        destination: itinerary.destination,
        startDate: itinerary.startDate,
        weatherSummary: itinerary.weatherSummary,
      });
    }

    const daysCount = itinerary.days?.length || 5;

    const weatherSummary = await getWeatherForecast({
      city: itinerary.destination,
      country: itinerary.country || null,
      startDate: itinerary.startDate,
      daysCount,
    });

    const enhancedWeather = weatherSummary.map((day, index) => {
      const originalActivity = itinerary.days?.[index]?.activities?.[0]?.task || "Free Exploration";
      // const originalActivity = itinerary.days?.[index]?.activity || "Free Exploration";
      const activitySwap = getActivitySuggestion(day.tag, originalActivity);
      return { ...day, activitySwap };
    });

    // await db.collection(itineraries).updateOne(
    //   { _id: new ObjectId(id) },
    //   { $set: { weatherSummary: enhancedWeather, weatherFetchedAt: new Date() } }
    // );

    await db.collection(itineraries).updateOne(
  { _id: new ObjectId(id) },
  { $set: { weatherSummary: enhancedWeather, weatherFetchedAt: new Date() } }
);

    return res.status(200).json({
      success: true,
      message: "Weather & activity recommendations generated",
      itineraryId: id,
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      weatherSummary: enhancedWeather,
    });
  } catch (error) {
    console.error("Itinerary Weather Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching weather data",
    });
  }
};



module.exports = { getItineraryWeather };