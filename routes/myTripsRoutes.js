const express = require("express");
const { getMyTrips, deleteMyTrip, addToMyTrips } = require("../controllers/myTripsController");
const auth = require("../middlewares/auth")
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

router.get("/", auth, getMyTrips);

router.post("/invite", authMiddleware, inviteMember);

router.patch("/accept-invite", authMiddleware, acceptInvitation);

module.exports = router;
