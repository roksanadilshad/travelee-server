// controllers/dealController.js

// 1. MUST BE AT THE TOP (Global Scope for this file)
let activeDeal = {
    id: "deal_001",
    destination: "Santorini, Greece",
    expiryDate: new Date(Date.now() + 3600000 * 5).toISOString(),
    totalSpots: 50,
    spotsTaken: 38,
    discount: "40%"
};

const getActiveDeal = async (req, res) => {
    res.status(200).json({ success: true, data: activeDeal });
};

const claimDealController = async (req, res) => {
    try {
        // Check if activeDeal exists
        if (!activeDeal) {
            return res.status(404).json({ success: false, message: "No active deal found" });
        }

        if (activeDeal.spotsTaken >= activeDeal.totalSpots) {
            return res.status(400).json({ success: false, message: "Sold out!" });
        }

        activeDeal.spotsTaken += 1;

        res.status(200).json({
            success: true,
            updatedSpots: activeDeal.spotsTaken
        });
    } catch (error) {
        console.error("Backend Error:", error); // This will show in your terminal
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getActiveDeal, claimDealController };