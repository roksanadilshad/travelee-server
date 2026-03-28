const express = require("express");
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  getRelatedDestinations,
  getTrendingDestinations,
  getRecommendations,
  addDestination,
  toggleDestinationVisibility,
  deleteDestination
} = require("../controllers/destinationController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", getDestinations);
router.get("/trending", getTrendingDestinations);
router.get("/recommendations/:email", getRecommendations);

router.get("/:id", getDestinationById);

router.get("/:id/related", getRelatedDestinations);
router.post("/add-destination", addDestination);
router.delete("/:id",authMiddleware, deleteDestination);
router.patch("/:id/visibility",authMiddleware, toggleDestinationVisibility);
module.exports = router;
