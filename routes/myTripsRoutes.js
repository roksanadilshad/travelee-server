const express = require("express");
const { getMyTrips, deleteMyTrip, addToMyTrips } = require("../controllers/myTripsController");

const router = express.Router();

router.post("/", addToMyTrips)

router.get("/", getMyTrips);


router.delete("/:id", deleteMyTrip);

module.exports = router;
