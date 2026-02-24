const express = require("express");
const { getMyTrips, deleteMyTrip ,addToMyTrips } = require("../controllers/myTripsController");

const router = express.Router();

 
router.get("/", getMyTrips);

 
router.delete("/:id", deleteMyTrip);


router.post("/", addToMyTrips);

module.exports = router;
