const { getDB } = require("../config/db");
const { destinations } = require("../constants/collections");
const { ObjectId } = require("mongodb");


const getDestinations =async (req,res)=>{
     const { city, category } = req.query;
  let query = {};

  if (city) {
    query.$and = [
      { title: { $regex: city, $options: 'i' } },
      { "location.city": { $regex: city, $options: 'i' } },
      { category: { $regex: city, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  const db = getDB();
  const result = await db.collection(destinations).find(query).toArray();
  res.send(result);
}

const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params; 
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const db = getDB();
    const destination = await db.collection(destinations).findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return res.status(404).send({ error: "Destination not found" });
    }

    res.send(destination);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

module.exports = {getDestinations, getDestinationById };
