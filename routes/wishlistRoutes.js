const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} = require("../controllers/wishlistController");

router.post("/", addToWishlist);
router.delete("/", removeFromWishlist);
router.get("/:email", getUserWishlist);

module.exports = router;