const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

const destinationRoutes = require("./routes/destinationRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const usersRoutes = require("./routes/userRoutes");
const myTripsRoutes = require("./routes/myTripsRoutes");
const tripreviewRoutes = require("./routes/tripreviewRoutes");
const app = express();
const port = process.env.PORT || 5000;
const dns = require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

// const auth = require("./middlewares/auth")

app.use(express.json());

const allowedOrigins = [
  "https://travelee-client.vercel.app", // Production
  "http://localhost:3000",              // Local Dev
  "http://localhost:5173"               // Vite Dev (if using Vite)
];

// app.use(cors({
//    origin: process.env.CLIENT_URL,
//     credentials: true
// }));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Route setup
app.use("/destinations", destinationRoutes);
app.use("/itineraries", itineraryRoutes);
app.use("/reviews", reviewRoutes);
app.use("/user", usersRoutes);
app.use("/my-trips", myTripsRoutes);
app.use("/api/tripreviews", tripreviewRoutes);
// app.use("/api", auth);

app.get("/", (req, res) => {
  res.send("Travelee Server is running...");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
module.exports = app;