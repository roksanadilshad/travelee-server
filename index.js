require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/db");

// Routes Import
const destinationRoutes = require("./routes/destinationRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const usersRoutes = require("./routes/userRoutes");
const myTripsRoutes = require("./routes/myTripsRoutes");
const tripreviewRoutes = require("./routes/tripreviewRoutes");
const paymentRoutes = require('./routes/paymentRoutes');
const wishlistRoutes = require("./routes/wishlistRoutes"); 
const adminRoutes = require("./routes/adminRoutes"); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json()); 

const allowedOrigins = [
  "https://travelee-client.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Socket Server Setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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

// Route Setup
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

// Database Connection & Server Start 
connectDB().then(() => {
    server.listen(port, () => {
      console.log(`🚀 Database Connected & Server listening on port ${port}`);
    });
}).catch(err => {
    console.error("Failed to connect to DB:", err);
});

module.exports = app;