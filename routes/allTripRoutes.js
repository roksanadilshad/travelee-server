const express = require('express');
const { getAllTrips } = require('../controllers/tripController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();


router.get("/", authMiddleware, getAllTrips);

module.exports = router;