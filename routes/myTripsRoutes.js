const express = require("express");
const { getMyTrips, deleteMyTrip } = require("../controllers/myTripsController");

const router = express.Router();

 
router.get("/", getMyTrips);

 
router.delete("/:id", deleteMyTrip);

module.exports = router;
