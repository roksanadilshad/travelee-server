const express = require("express");
const router = express.Router();
const {
  getMyTrips,
  deleteMyTrip,
  addToMyTrips,
} = require("../controllers/myTripsController");

const {
  inviteMember,
  acceptInvitation,
} = require("../controllers/invitationController");

const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getMyTrips);
router.post("/", authMiddleware, addToMyTrips);
router.delete("/:id", authMiddleware, deleteMyTrip);

router.post("/invite", authMiddleware, inviteMember);

router.patch("/accept-invite", authMiddleware, acceptInvitation);

module.exports = router;
