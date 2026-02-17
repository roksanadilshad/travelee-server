const { getDB } = require("../config/db");
const { destinations } = require("../constants/collections");


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
module.exports = {getDestinations}