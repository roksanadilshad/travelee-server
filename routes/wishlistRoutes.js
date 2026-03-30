const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} = require("../controllers/wishlistController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/",authMiddleware, addToWishlist);
router.delete("/",authMiddleware, removeFromWishlist);
router.get("/:email",authMiddleware, getUserWishlist);

module.exports = router;