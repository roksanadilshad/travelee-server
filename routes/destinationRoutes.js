const express = require("express");
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  getRelatedDestinations,
  getTrendingDestinations,
} = require("../controllers/destinationController");

router.get("/", getDestinations);
router.get("/trending", getTrendingDestinations);

router.get("/:id", getDestinationById);

router.get("/:id/related", getRelatedDestinations);

module.exports = router;
