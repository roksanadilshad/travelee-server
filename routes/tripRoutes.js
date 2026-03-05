// backend/routes/tripRoutes.js
const express = require('express');
const router = express.Router();

router.get('/my-trips', async (req, res) => {
  try {
    const email = req.query.email;
    const db = req.app.locals.db; 

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Querying the "trips" collection
    const trips = await db.collection('trips')
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json(trips);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;