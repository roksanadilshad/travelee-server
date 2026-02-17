const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("traveleeDB");

const collections = {
    destinations: db.collection("destinations"),
    itineraries: db.collection("itineraries"),
    users: db.collection("users")
};

module.exports = collections;