const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI; 
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
        await client.connect(); 
    // Connect to the "traveleeDB" database
    const database = client.db("traveleeDB");
    const destinationsCollection = database.collection("destinations");
    const reviewsCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

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