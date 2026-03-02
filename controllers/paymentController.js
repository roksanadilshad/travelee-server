const stripe = require('../config/stripe');
const { connectDB } = require("../config/db");
const { mytrips } = require("../constants/collections");
const { ObjectId } = require("mongodb");

const createCheckoutSession = async (req, res) => {
  try {
    const { 
  destination_id, 
  country, 
  city, 
  region, 
  startDate, 
  endDate, 
  duration, 
  userEmail, 
  userName, 
  media,
  totalCost 
} = req.body;
    const db = await connectDB();

    // STEP 1: Save the trip to your "mytrips" collection as PENDING
    const tripRecord = {
  destination_id,
  country,
  startDate,
  endDate,
  duration,
  city,
  region,
  media, // This will now save the { cover_image: "..." } object
  userEmail,
  userName,
  totalCost,
  status: "pending",
  createdAt: new Date()
};
    
    const result = await db.collection(mytrips).insertOne(tripRecord);
    const tripId = result.insertedId;

    // STEP 2: Create the Stripe Session
    const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { 
        // FIX: Changed 'destination' to 'city' to match your destructured variables
        name: `Trip to ${city}, ${country}`, 
        images: [media?.cover_image].filter(Boolean), // Optional: Show trip image on Stripe page
      },
      unit_amount: Math.round(totalCost * 100),
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.FRONTEND_URL}/success?tripId=${tripId}`,
  cancel_url: `${process.env.FRONTEND_URL}/itinerary`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// STEP 3: The function that turns "pending" into "paid"
const markAsPaid = async (req, res) => {
  try {
    const { tripId } = req.body;
    const db = await connectDB();

    await db.collection(mytrips).updateOne(
      { _id: new ObjectId(tripId) },
      { $set: { status: "paid" } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};

module.exports = { createCheckoutSession, markAsPaid };