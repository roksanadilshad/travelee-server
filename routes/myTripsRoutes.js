const express = require("express");
const { getMyTrips, deleteMyTrip, addToMyTrips } = require("../controllers/myTripsController");

const router = express.Router();

router.get("/", getMyTrips);
router.post("/", addToMyTrips)



router.delete("/:id", deleteMyTrip);

module.exports = router;
