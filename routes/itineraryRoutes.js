const express = require("express");
const {
  createItinerary,
  getUserItineraries,
  deleteItinerary,
  deleteActivity,
  updateItinerary,
} = require("../controllers/itineraryController");
const validateItinerary = require("../middlewares/itineraryValidation");

const router = express.Router();

router.post("/", validateItinerary, createItinerary);
// router.get('/', getUserItineraries);
router.get("/:email", getUserItineraries);
const express = require('express');
const { createItinerary, getUserItineraries, deleteItinerary, deleteActivity, getSingleItinerary } = require('../controllers/itineraryController');
const validateItinerary = require('../middlewares/itineraryValidation');


const router = express.Router();

router.post('/',validateItinerary, createItinerary);
router.get('/user/:email', getUserItineraries);
router.delete("/:id", deleteItinerary);
router.get("/:id", getSingleItinerary);
router.delete("/:itineraryId/activity/:activityId", deleteActivity);

// --- NEW CODE START ---
router.patch("/:id", updateItinerary);
// --- NEW CODE END ---

module.exports = router;
