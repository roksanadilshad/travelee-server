const { ObjectId } = require("mongodb");

exports.inviteMember = async (req, res) => {
  try {
    const { tripId, friendEmail } = req.body;
    const senderEmail = req.user.email;
    const db = req.app.locals.db;

    // Validation: tripId and friendEmail required
    if (!tripId || !friendEmail) {
      return res.status(400).json({
        success: false,
        message: "tripId and friendEmail are required",
      });
    }

    // Validate tripId format
    if (!ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tripId",
      });
    }

    // Prevent inviting self
    if (senderEmail === friendEmail) {
      return res.status(400).json({
        success: false,
        message: "You cannot invite yourself!",
      });
    }

    // Check if friend exists
    const friend = await db.collection("users").findOne({ email: friendEmail });
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email!",
      });
    }

    // Check if already a member
    const alreadyMember = await db.collection("itineraries").findOne({
      _id: new ObjectId(tripId),
      "members.email": friendEmail,
    });

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already invited or a member!",
      });
    }

    // Add friend to members with pending status
    const result = await db.collection("itineraries").updateOne(
      { _id: new ObjectId(tripId) },
      {
        $addToSet: {
          members: {
            email: friendEmail,
            name: friend.fullName || friend.name || "Unknown",
            image: friend.image || null,
            status: "pending",
          },
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Trip not found!" });
    }

    res.status(200).json({
      success: true,
      friendId: friendEmail,
      message: "Invitation sent successfully!",
    });
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const { tripId } = req.body;
    const userEmail = req.user.email;
    const db = req.app.locals.db;

    if (!tripId) {
      return res.status(400).json({ success: false, message: "tripId is required" });
    }

    if (!ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid tripId" });
    }

    const result = await db.collection("itineraries").updateOne(
      {
        _id: new ObjectId(tripId),
        "members.email": userEmail,
      },
      {
        $set: { "members.$.status": "accepted" },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No pending invitation found.",
      });
    }

    res.status(200).json({ success: true, message: "Invitation accepted!" });
  } catch (error) {
    console.error("Accept Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};