const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

const destinationRoutes = require("./routes/destinationRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const usersRoutes = require("./routes/userRoutes");
const myTripsRoutes = require("./routes/myTripsRoutes");
const app = express();
const port = process.env.PORT || 5000;
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1"]);
 

app.use(cors());
app.use(express.json());

connectDB();

// Route setup
app.use("/destinations", destinationRoutes);
app.use("/itineraries", itineraryRoutes);
app.use("/reviews", reviewRoutes);
app.use("/user", usersRoutes);
app.use("/my-trips", myTripsRoutes);

app.get("/", (req, res) => {
  res.send("Travelee Server is running...");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
