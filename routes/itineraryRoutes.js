const express = require('express');
const { createItinerary, getUserItineraries } = require('../controllers/itineraryController');


const router = express.Router();

router.post('/', createItinerary);
router.get('/', getUserItineraries);

module.exports = router;
