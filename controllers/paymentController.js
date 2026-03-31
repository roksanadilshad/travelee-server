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
      totalCost,
      hasFlashDeal // New field from frontend
    } = req.body;

    const db = await connectDB();

    // --- DISCOUNT LOGIC ---
    let finalCost = totalCost;
    let discountNote = "";

    if (hasFlashDeal) {
      // Apply the 40% discount on the server side for security
      finalCost = totalCost * 0.60; 
      discountNote = " (Flash Deal 40% OFF Applied)";
    }
    // -----------------------

    // STEP 1: Save the trip as PENDING
    const tripRecord = {
      destination_id,
      country,
      startDate,
      endDate,
      duration,
      city,
      region,
      media,
      userEmail,
      userName,
      originalCost: totalCost, // Keep record of original price
      totalCost: finalCost,    // Save the actual price paid
      discountApplied: hasFlashDeal ? "40%" : "0%",
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
            name: `Trip to ${city}, ${country}${discountNote}`, 
            images: [media?.cover_image].filter(Boolean),
            description: hasFlashDeal ? "Special promotional discount" : "Standard booking",
          },
          unit_amount: Math.round(finalCost * 100), // Stripe expects cents/poisha
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?tripId=${tripId}`,
      cancel_url: `${process.env.CLIENT_URL}/itinerary`,
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