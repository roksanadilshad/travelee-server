require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const nodemailer = require("nodemailer");
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
const itineraryWeatherRoutes = require("./routes/itineraryWeatherRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const port = process.env.PORT || 5000;
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1"]);

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
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
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
});

app.locals.io = io;

let activeUsers = {};

io.on("connection", (socket) => {
  console.log(`🚀 New client connected: ${socket.id}`);

  socket.on("join-self", (email) => {
    if (email) {
      socket.join(email);
      console.log(`👤 User joined personal room: ${email}`);
    }
  });

  socket.on("send-invite", (data) => {
    if (data && data.friendId) {
      io.to(data.friendId).emit("receive-invite", data);
      console.log(`📩 Real-time invite sent to: ${data.friendId}`);
    }
  });

  socket.on("join-trip", ({ tripId, user }) => {
    if (!tripId || tripId === "temp-id" || !user || !user.email) return;
    socket.join(tripId);
    socket.currentTripId = tripId;
    socket.userEmail = user.email;

    if (!activeUsers[tripId]) activeUsers[tripId] = [];
    const alreadyInRoom = activeUsers[tripId].find(
      (u) => u.socketId === socket.id,
    );
    if (!alreadyInRoom) {
      activeUsers[tripId].push({ ...user, socketId: socket.id });
    }
    const uniqueUsers = Array.from(
      new Map(activeUsers[tripId].map((u) => [u.email, u])).values(),
    );
    io.to(tripId).emit("user-presence", uniqueUsers);
  });

  socket.on("send-activity", (data) => {
    if (data && data.tripId) {
      socket.to(data.tripId).emit("receive-activity", data);
    }
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
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// --- Hybrid Email Invitation Route ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

app.post("/my-trips/invite-hybrid", async (req, res) => {
  const { tripId, friendEmail, senderName, tripTitle, friendId } = req.body;

  try {
    const frontendURL = process.env.CLIENT_URL || "http://localhost:3000";
    const inviteLink = `${frontendURL}/itinerary/${tripId}?invited=true`;

    await transporter.sendMail({
      from: `"Travelee" <${process.env.MAIL_USER}>`,
      to: friendEmail,
      subject: `Trip Invitation from ${senderName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0EA5A4;">Trip Invitation!</h2>
          <p>Hi there,</p>
          <p><b>${senderName}</b> has invited you to collaborate on the trip: <b>${tripTitle}</b>.</p>
          <p>Click the button below to join the planning:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 25px; background-color: #0EA5A4; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Accept & Join</a>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">If the button doesn't work, copy-paste this link: ${inviteLink}</p>
        </div>
      `,
    });

    if (friendId) {
      io.to(friendId).emit("receive-invite", { senderName, tripId, tripTitle });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Invited successfully via Email & Socket!",
      });
  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ success: false, message: "Email failed to send." });
  }
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
app.use("/api/payments", paymentRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Travelee Server is running with Real-time Engine...");
});

server.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});

module.exports = app;
