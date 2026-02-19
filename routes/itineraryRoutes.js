const express = require('express');
const { createItinerary, getUserItineraries, deleteItinerary, deleteActivity } = require('../controllers/itineraryController');


const router = express.Router();

router.post('/', createItinerary);
router.get('/', getUserItineraries);
router.delete("/:id", deleteItinerary);
router.delete("/itineraries/:itineraryId/activity/:activityId", deleteActivity);

module.exports = router;
