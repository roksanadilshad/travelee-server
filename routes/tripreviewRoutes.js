const express = require("express");
const { addTripReview, getTripReviews } = require("../controllers/tripreviewController");

const router = express.Router();

 
router.post("/", addTripReview);

 
router.get("/", getTripReviews);

module.exports = router;
