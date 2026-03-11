// routes/itineraryWeatherRoutes.js
const express = require("express");
const { getItineraryWeather } = require("../controllers/itineraryWeatherController");
const { getTripWeatherPay } = require("../controllers/weatherController");

const router = express.Router();

router.get("/:id/weather", getItineraryWeather);
router.get("/:id/myTrip/weather",getTripWeatherPay);

module.exports = router;