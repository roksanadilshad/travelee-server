const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

const client = new MongoClient(uri, {
  maxPoolSize: 10,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) return cachedDb;

  try {
    const connection = await client.connect();
    cachedDb = connection.db("traveleeDB");

    console.log("MongoDB Connected");
    return cachedDb;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
};

module.exports = { connectDB };