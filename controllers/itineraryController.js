const { itineraries } = require("../config/db");

const saveItinerary = async (req, res) => {
    try {
        const result = await itineraries.insertOne(req.body);
        res.status(201).send(result);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

module.exports = { saveItinerary };