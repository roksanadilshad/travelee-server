const express = require("express");
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  getRelatedDestinations,
} = require("../controllers/destinationController");

router.get("/", getDestinations);

router.get("/:id", getDestinationById);

router.get("/:id/related", getRelatedDestinations);

module.exports = router;
