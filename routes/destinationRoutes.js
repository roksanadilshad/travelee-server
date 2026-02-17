// const express = require('express');
// const router = require('./itineraryRoutes');
// const { getDestinations } = require('../controllers/destinationController');

// router = express.Router()
// router.get('/',getDestinations)

// module.exports = router;

const express = require('express');
const { getDestinations } = require('../controllers/destinationController');

const router = express.Router();

router.get('/', getDestinations);

module.exports = router;
