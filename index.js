require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // <-- NEW CODE
const { Server } = require("socket.io"); // <-- NEW CODE
require("dotenv").config();

const { connectDB } = require("./config/db");

const destinationRoutes = require("./routes/destinationRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const usersRoutes = require("./routes/userRoutes");
const myTripsRoutes = require("./routes/myTripsRoutes");
const tripreviewRoutes = require("./routes/tripreviewRoutes");

const paymentRoutes = require('./routes/paymentRoutes');
const app = express();
const port = process.env.PORT || 5000;
const dns = require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

// --- NEW CODE START (Socket Server Setup) ---

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://travelee-client.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
  },
});

let activeUsers = {};

io.on("connection", (socket) => {
  socket.on("join-trip", ({ tripId, user }) => {
    socket.join(tripId);
    if (!activeUsers[tripId]) activeUsers[tripId] = [];

    activeUsers[tripId].push({ ...user, socketId: socket.id });

    const uniqueUsers = Array.from(
      new Map(activeUsers[tripId].map((u) => [u.email, u])).values(),
    );
    io.to(tripId).emit("user-presence", uniqueUsers);
    socket.currentTripId = tripId;
  });

  socket.on("send-activity", (data) => {
    console.log("Server received activity:", data);
    io.to(data.tripId).emit("receive-activity", data);
  });

  socket.on("disconnect", () => {
    const tripId = socket.currentTripId;
    if (tripId && activeUsers[tripId]) {
      activeUsers[tripId] = activeUsers[tripId].filter(
        (u) => u.socketId !== socket.id,
      );

      const uniqueUsers = Array.from(
        new Map(activeUsers[tripId].map((u) => [u.email, u])).values(),
      );
      io.to(tripId).emit("user-presence", uniqueUsers);
    }
  });
});
// --- NEW CODE END ---

// app.use(express.json());

const allowedOrigins = [
  "https://travelee-client.vercel.app", // Production
  "http://localhost:3000", // Local Dev
  "http://localhost:5173", // Vite Dev (if using Vite)
];

// app.use(cors({
//    origin: process.env.CLIENT_URL,
//     credentials: true
// }));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Check if the origin is in our allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Route setup
app.use("/destinations", destinationRoutes);
app.use("/itineraries", itineraryRoutes);
app.use("/reviews", reviewRoutes);
app.use("/user", usersRoutes);
app.use("/my-trips", myTripsRoutes);
app.use("/api/tripreviews", tripreviewRoutes);
app.use("/wishlists", wishlistRoutes);
app.use('/api/payments', paymentRoutes);

app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Travelee Server is running...");
});

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// }); // comment roky---<<<

// --- CHANGE START ---
// app.listen এর বদলে server.listen
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
// --- CHANGE END ---

module.exports = app;
// });
module.exports = app;
