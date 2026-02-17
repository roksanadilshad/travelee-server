const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let database;

const connectDB = async () => {
  try {
    await client.connect();
    database = client.db("traveleeDB");
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // server stop
  }
};

const getDB = () => database;

module.exports = { connectDB, getDB };