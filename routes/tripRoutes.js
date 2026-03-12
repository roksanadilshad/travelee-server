const express = require("express");
const router = express.Router();
const { inviteMember, acceptInvitation } = require("../controllers/invitationController");
const authMiddleware = require("../middlewares/authMiddleware"); 


router.post("/invite", authMiddleware, inviteMember);


router.patch("/accept-invitation", authMiddleware, acceptInvitation);


router.get("/", authMiddleware, async (req, res) => {
  try {
  
    const email = req.user.email; 
    const db = req.app.locals.db;

    const trips = await db
      .collection("trips")
      .find({
        $or: [
          { userEmail: email }, 
          { "members.email": email } 
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(trips);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;