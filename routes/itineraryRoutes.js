const express = require('express');
const router = express.Router();
const { saveItinerary } = require('../controllers/itineraryController');

router.post('/', saveItinerary);

module.exports = router;