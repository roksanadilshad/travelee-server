const { getDB, connectDB } = require("../config/db");
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
    limit = 10,
    sort
  } = req.query;

  const db = await connectDB()

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
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    const totalCount = await db.collection("destinations").countDocuments(query);
    const totalPages = Math.ceil(totalCount / lim);

    let data = await db
      .collection("destinations")
      .find(query)
      .skip(skip)
      .limit(lim)
      .toArray();

    //(Price Sorting)
    if (sort === "priceLow" || sort === "priceHigh") {
      data.sort((a, b) => {

        const cleanA = a.price?.replace(/[^0-9-]/g, "") || "";
        const cleanB = b.price?.replace(/[^0-9-]/g, "") || "";

        const minA = Number(cleanA.split("-")[0]);
        const minB = Number(cleanB.split("-")[0]);

        if (sort === "priceLow") {
          return minA - minB;
        } else {
          return minB - minA;
        }
      });
    }

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

    const db = await connectDB();;
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

    const db = await connectDB();

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
          { country: main.country },
          { region: main.region },
          { best_time_to_visit: main.best_time_to_visit },
          { avgBudget: main.avgBudget },
          { duration: main.duration },
        ],
      })
      .sort({ popularityScore: -1 })
      .limit(6)
      .toArray();
    res.send(related);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

const getTrendingDestinations = async (req, res) => {
  try {
    const db = await connectDB();
    
    // Primary query: look for flagged trending items
    let data = await db
      .collection(destinations)
      .find({ isTrending: true })
      .sort({ popularityScore: -1 })
      .limit(8)
      .toArray();

    // Fallback: If no one flagged "isTrending", show top popularity items
    if (data.length === 0) {
      data = await db
        .collection(destinations)
        .find({})
        .sort({ popularityScore: -1 })
        .limit(8)
        .toArray();
    }

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};


module.exports = { getTrendingDestinations, getDestinations, getDestinationById, getRelatedDestinations };
