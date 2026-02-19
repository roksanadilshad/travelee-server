const { getDB } = require("../config/db");
const { destinations } = require("../constants/collections");
const { ObjectId } = require("mongodb");

const getDestinations = async (req, res) => {
  const { city, country, region, page = 1, limit = 10 } = req.query;
  const db = getDB();

  let filters = [];

  if (city) {
    filters.push({ city: { $regex: city, $options: "i" } });
  }

  if (country) {
    filters.push({ country: { $regex: country, $options: "i" } });
  }

  if (region) {
    filters.push({ region: { $regex: region, $options: "i" } });
  }

  let query = {};
  if (filters.length > 0) {
    query = { $or: filters };
  }

  try {
    //  Pagination calculation
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);
    const totalCount = await db.collection(destinations).countDocuments(query);
    const totalPages = Math.ceil(totalCount / lim);
    const data = await db
      .collection(destinations)
      .find(query)
      .skip(skip)
      .limit(lim)
      .toArray();

    res.send({
      data,
      page: parseInt(page),
      totalPages,
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const db = getDB();
    const destination = await db
      .collection(destinations)
      .findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return res.status(404).send({ error: "Destination not found" });
    }

    res.send(destination);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

module.exports = { getDestinations, getDestinationById };
