const express = require('express');
const { createItinerary, getUserItineraries, deleteItinerary } = require('../controllers/itineraryController');


const router = express.Router();

router.post('/', createItinerary);
router.get('/', getUserItineraries);
router.delete("/:id", deleteItinerary);

module.exports = router;
