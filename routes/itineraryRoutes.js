const express = require("express");
const {
  createItinerary,
  getUserItineraries,
  deleteItinerary,
  deleteActivity,
  updateItinerary,
  getSingleItinerary,
} = require("../controllers/itineraryController");
const validateItinerary = require("../middlewares/itineraryValidation");

const router = express.Router();

router.post('/',validateItinerary, createItinerary);
router.get('/user/:email', getUserItineraries);
router.get('/', getUserItineraries);
router.delete("/:id", deleteItinerary);
router.get("/:id", getSingleItinerary);

router.patch("/:id", updateItinerary);

router.delete("/:id", deleteItinerary);

router.delete("/:itineraryId/activity/:activityId", deleteActivity);

module.exports = router;
