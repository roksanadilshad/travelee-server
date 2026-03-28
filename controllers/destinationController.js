const { getDB, connectDB } = require("../config/db");
const { destinations } = require("../constants/collections");
const { ObjectId } = require("mongodb");

const getDestinations = async (req, res) => {
  const {
    city,
    country,
    region,
    duration,
    budget,
    rating,
    month,
    page = 1,
    limit = 10,
    sort,
  } = req.query;

  const db = await connectDB();

  let filters = [];

  if (city) {
    filters.push({
      $or: [
        { city: { $regex: city, $options: "i" } },
        { country: { $regex: city, $options: "i" } },
        { region: { $regex: city, $options: "i" } },
      ],
    });
  }

  if (duration && duration !== "Any") {
    filters.push({
      duration: { $regex: duration, $options: "i" },
    });
  }

  if (budget) {
    filters.push({
      price: { $regex: budget, $options: "i" },
    });
  }

  if (rating) {
    filters.push({ popularityScore: { $gte: Number(rating) } });
  }

  if (month && month !== "Any") {
    filters.push({
      best_time_to_visit: { $regex: month, $options: "i" },
    });
  }

  let query = {};
  if (filters.length > 0) {
    query = { $and: filters };
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    const totalCount = await db
      .collection("destinations")
      .countDocuments(query);
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


    const db = req.app.locals.db;

    if (!db) {
      return res
        .status(500)
        .send({ error: "Database connection not established" });
    }

    let queryConditions = [];


    if (ObjectId.isValid(id)) {
      queryConditions.push({ _id: new ObjectId(id) });
    }


    queryConditions.push({ destination_id: id });
    queryConditions.push({ tripId: id });

    const query = { $or: queryConditions };


    let data = await db.collection("destinations").findOne(query);


    if (!data) {
      data = await db.collection("itineraries").findOne(query);
    }

    if (!data) {
      return res.status(404).send({ error: "Destination not found" });
    }


    res.status(200).send(data);
  } catch (err) {
    console.error("Fetch Error:", err);
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
const getRecommendations = async (req, res) => {
  try {
    const { email } = req.params;
    const db = await connectDB();

    // 1. Fetch the user's current wishlist
    const userWishlist = await db
      .collection("wishlists")
      .find({ userEmail: email })
      .toArray();

    // If wishlist is empty, return an empty array 
    if (userWishlist.length === 0) {
      return res.send([]);
    }

    // 2. Extract unique traits from the wishlist
    const countries = [
      ...new Set(userWishlist.map((w) => w.country).filter(Boolean)),
    ];
    const regions = [
      ...new Set(userWishlist.map((w) => w.region).filter(Boolean)),
    ];
    const durations = [
      ...new Set(userWishlist.map((w) => w.duration).filter(Boolean)),
    ];
    const budgets = [
      ...new Set(userWishlist.map((w) => w.avgBudget).filter(Boolean)),
    ];

    // Extract Mongo IDs to exclude items already in the wishlist
    const wishlistedIds = userWishlist.map(
      (w) => new ObjectId(w.destinationMongoId),
    );

    // 3. Find destinations matching ANY of these traits, excluding the ones already 
    const recommendations = await db
      .collection("destinations")
      .find({
        _id: { $nin: wishlistedIds },
        $or: [
          { country: { $in: countries } },
          { region: { $in: regions } },
          { duration: { $in: durations } },
          { avgBudget: { $in: budgets } },
        ],
      })
      .sort({ popularityScore: -1 }) // Sort by highest rating/popularity first
      .limit(6) // Limit to 6 suggestions
      .toArray();

    res.send(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};




// Add Destination from Admin Dashboard
const addDestination = async (req, res) => {
  try {
    const db = await connectDB();
    const destinationData = req.body;

    const lastDest = await db.collection("destinations")
      .find({ destination_id: { $regex: /^d\d+/ } })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    let nextId;
    if (lastDest.length > 0) {
      const lastNumericId = parseInt(lastDest[0].destination_id.replace(/\D/g, ''));

      if (!isNaN(lastNumericId)) {
        nextId = "d" + (lastNumericId + 1);
      } else {
        nextId = "d2001";
      }
    } else {
      nextId = "d2001";
    }

    const finalData = {
      destination_id: nextId,
      country: destinationData.country,
      city: destinationData.city,
      region: destinationData.region,
      coordinates: destinationData.coordinates,
      timezone: destinationData.timezone,
      best_time_to_visit: destinationData.best_time_to_visit,
      currency: destinationData.currency,
      languages_spoken: destinationData.languages_spoken,
      safety_index: destinationData.safety_index,
      description: destinationData.description,
      duration: destinationData.duration,
      price: destinationData.price,
      popularityScore: destinationData.popularityScore,
      avgBudget: destinationData.avgBudget,
      climate: destinationData.climate,
      media: destinationData.media,
      createdAt: new Date(),
    };

    const result = await db.collection("destinations").insertOne(finalData);

    if (result.insertedId) {
      res.status(201).send({
        success: true,
        message: "Destination added successfully",
        id: result.insertedId,
        destination_id: nextId
      });
    } else {
      res.status(400).send({ error: "Failed to add destination" });
    }
  } catch (err) {
    console.error("Error adding destination:", err);
    res.status(500).send({ error: "Server error during adding destination" });
  }
};
// Delete Destination
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    const result = await db.collection("destinations").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }
    return res.status(200).json({ success: true, message: "Destination deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Toggle Visibility (Hide/Show)
const toggleDestinationVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body; // Expects true or false

    const db = await connectDB();
    const result = await db.collection("destinations").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isVisible: isVisible } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Destination is now ${isVisible ? 'visible' : 'hidden'}` 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



module.exports = {
  getTrendingDestinations,
  getDestinations,
  getDestinationById,
  getRelatedDestinations,
  getRecommendations,
  addDestination,
  deleteDestination,
  toggleDestinationVisibility
};
