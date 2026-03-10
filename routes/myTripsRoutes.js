const express = require("express");
const { getMyTrips, deleteMyTrip, addToMyTrips } = require("../controllers/myTripsController");
const auth = require("../middlewares/auth")
const router = express.Router();

router.post("/", addToMyTrips)

router.get("/", auth, getMyTrips);


router.delete("/:id", deleteMyTrip);

module.exports = router;
