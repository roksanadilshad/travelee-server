const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { getAdminAnalytics } = require("../controllers/analyticsController");

router.get("/analytics",authMiddleware,adminMiddleware,getAdminAnalytics);

module.exports = router;