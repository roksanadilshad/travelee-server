const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


async function run() {
  try {
        await client.connect(); 
    // Connect to the "traveleeDB" database
    const database = client.db("traveleeDB");
    const destinationsCollection = database.collection("destinations");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");
    const itinerariesCollection = database.collection("itineraries");

    // --- API ROUTES ---

    // 1. Get all destinations (For Search/Filter)
    app.get('/destinations', async (req, res) => {
        const{city, category} = req.query;
        let query = {};

        //city
        if(city){
        query = {
            $or: [
                { title: { $regex: city, $options: 'i' } },
                { "location.city": { $regex: city, $options: 'i' } },
                { category: { $regex: city, $options: 'i' } }
            ]
        };
    }
        //catagory
        if(category){
            query.category = category;
        }
        
      const cursor = destinationsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // 1. POST: Create a New Itinerary
// app.post('/itineraries', async (req, res) => {
//   try {
//     const itinerary = req.body;

//     // Production Step: Validation
//     if (!itinerary.userEmail || !itinerary.destination || !itinerary.startDate) {
//       return res.status(400).send({ error: "Missing required fields" });
//     }

//     // Add metadata
//     const newItinerary = {
//       ...itinerary,
//       createdAt: new Date(),
//       status: 'upcoming'
//     };

//     const result = await itinerariesCollection.insertOne(newItinerary);
//     res.status(201).send(result); 
//   } catch (error) {
//     console.error("Error creating itinerary:", error);
//     res.status(500).send({ error: "Failed to create itinerary" });
//   }
// });

app.post('/itineraries', async (req, res) => {
  try {
    const tripData = req.body;

    // 1. Basic Validation
    if (!tripData.destination || tripData.days.length === 0) {
      return res.status(400).send({ message: "Trip must have a destination and at least one day." });
    }

    // 2. Insert into MongoDB
    const result = await itinerariesCollection.insertOne({
      ...tripData,
      status: 'saved',
      updatedAt: new Date()
    });

    res.status(201).send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});


// 2. GET: Fetch Itineraries for a specific user
app.get('/itineraries/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const query = { userEmail: email };
    
    // Sort by newest first
    const result = await itinerariesCollection.find(query).sort({ createdAt: -1 }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch itineraries" });
  }
});

    // 2. Add a new review
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    console.log("Successfully connected to MongoDB!");
  } finally {
    //connection open
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Travelee Server is running...');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});