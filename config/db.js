const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

const connectDB = async () => {
  if (!database) {
    await client.connect();
    database = client.db("traveleeDB");
    console.log("MongoDB Connected");
  }
  return database;
};

const getDB = () => database;

module.exports = { connectDB, getDB };