const { getDB } = require("../config/db");
const { destinations } = require("../constants/collections");
const { ObjectId } = require("mongodb");

const getDestinations = async (req, res) => {
  const { city,
    country,
    region,
    duration,
    budget,
    rating,
    month,
    page = 1,
    limit = 10 } = req.query;
  const db = getDB();

  let filters = [];

  if (city) {
    filters.push({
      $or: [
        { city: { $regex: city, $options: "i" } },
        { country: { $regex: city, $options: "i" } },
        { region: { $regex: city, $options: "i" } }
      ]
    });
  }

  if (duration && duration !== "Any") {
    filters.push({
      duration: { $regex: duration, $options: "i" }
    });
  }

  // Price range
  if (budget) {
    filters.push({
      price: { $regex: budget, $options: "i" }
    });
  }

  if (rating) {
    filters.push({ popularityScore: { $gte: Number(rating) } });
  }

  if (month && month !== "Any") {
    filters.push({
      best_time_to_visit: { $regex: month, $options: "i" }
    });
  }

  let query = {};
  if (filters.length > 0) {
    query = { $and: filters };
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

//  ADD RELATED DESTINATIONS --->>

const getRelatedDestinations = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const db = getDB();

    const main = await db
      .collection(destinations)
      .findOne({ _id: new ObjectId(id) });

    if (!main) {
      return res.status(404).send({ error: "Destination not found" });
    }

    // find related price
    const related = await db
  .collection(destinations)
  .find({
    _id: { $ne: main._id },
    $or: [
      { country: main.country }, // same country
      { region: main.region },   // same region
      { best_time_to_visit: main.best_time_to_visit }, // same season
      { avgBudget: main.avgBudget }, // similar budget
      { duration: main.duration }, // similar trip length
    ],
  })
  .sort({ popularityScore: -1 }) // show popular first
  .limit(6)
  .toArray();
    res.send(related);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

module.exports = { getDestinations, getDestinationById,getRelatedDestinations };
