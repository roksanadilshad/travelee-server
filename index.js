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
const paymentRoutes = require("./routes/paymentRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
//const paymentRoutes = require('./routes/paymentRoutes');
const itineraryWeatherRoutes = require("./routes/itineraryWeatherRoutes");
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
  }),
);

// Database Connection
connectDB()
  .then((database) => {
    app.locals.db = database;
    console.log("✅ MongoDB connected and shared via app.locals.db");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
  });

// --- Socket Server Setup ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization", "auth-token"]
});

let activeUsers = {};

io.on("connection", (socket) => {
  console.log(` New client connected: ${socket.id}`);

  // Personal room for notifications/invites
  socket.on("join-personal-room", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(` User joined personal room: ${userId}`);
    }
  });

  // Sending an invite to a friend
  socket.on("send-invite", (data) => {
    // data = { friendId, senderName, tripId, tripTitle }
    if (data && data.friendId) {
      io.to(data.friendId).emit("receive-invite", data);
      console.log(` Invite sent to: ${data.friendId}`);
    }
  });

  // Joining a trip collaboration room
  socket.on("join-trip", ({ tripId, user }) => {
    // Safety check to prevent "undefined" or "temp-room" issues
    if (!tripId || tripId === "temp-id" || !user || !user.email) {
      return console.log(" Invalid tripId or user data for collaboration.");
    }

    socket.join(tripId);
    socket.currentTripId = tripId;
    socket.userEmail = user.email;

    if (!activeUsers[tripId]) activeUsers[tripId] = [];

    // Check if the user is already tracked in activeUsers for this room
    const alreadyInRoom = activeUsers[tripId].find(
      (u) => u.socketId === socket.id,
    );
    if (!alreadyInRoom) {
      const displayName = user.name || user.email.split("@")[0];
      activeUsers[tripId].push({
        ...user,
        name: displayName,
        socketId: socket.id,
      });
    }

    // Emit unique user list to everyone in the room
    const uniqueUsers = Array.from(
      new Map(activeUsers[tripId].map((u) => [u.email, u])).values(),
    );
    io.to(tripId).emit("user-presence", uniqueUsers);

    console.log(
      `✈️ ${user.name || user.email} joined trip collaboration: ${tripId}`,
    );
  });

  // Real-time activity sync (Itinerary updates)
  socket.on("send-activity", (data) => {
    if (data && data.tripId) {
      console.log("Broadcast activity to room:", data.tripId);
      socket.to(data.tripId).emit("receive-activity", data);
    }
  });

  // Typing indicators
  socket.on("typing-start", ({ tripId, userName }) => {
    if (tripId) {
      socket.to(tripId).emit("user-is-typing", { userName });
    }
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    const tripId = socket.currentTripId;
    if (tripId && activeUsers[tripId]) {
      // Remove the disconnected socket
      activeUsers[tripId] = activeUsers[tripId].filter(
        (u) => u.socketId !== socket.id,
      );

      const uniqueUsers = Array.from(
        new Map(activeUsers[tripId].map((u) => [u.email, u])).values(),
      );
      io.to(tripId).emit("user-presence", uniqueUsers);
    }
    console.log(`❌ Client disconnected: ${socket.id}`);
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
app.use("/itinerary", itineraryWeatherRoutes);
app.use('/api/payments', paymentRoutes);

app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Travelee Server is running with Real-time Engine...");
});

server.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});

module.exports = app;
