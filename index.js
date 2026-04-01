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
const dealRoutes = require('./routes/dealRoutes');
const chatRoutes = require('./routes/chatRoutes');


const app = express();
const port = process.env.PORT || 5000;
const dns = require("node:dns/promises");
const { getAllTrips } = require("./controllers/tripController");
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
      socket.to(data.friendId).emit("receive-invite", data);
      console.log(
        `📩 Real-time invite from ${data.senderEmail} to: ${data.friendId}`,
      );
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
  const { tripId, friendEmail, senderName, senderEmail, tripTitle, friendId } =
    req.body;

  try {
    const frontendURL =
      process.env.CLIENT_URL || "https://travelee-client.vercel.app";
    const inviteLink = `${frontendURL}/destinations/${tripId}?invited=true&by=${encodeURIComponent(senderEmail)}`;

    await transporter.sendMail({
      from: `"Travelee" <${process.env.MAIL_USER}>`,
      to: friendEmail,
      subject: `Trip Invitation: Join ${senderName} to ${tripTitle}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background-color: #f4f7f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <div style="background-color: #0EA5A4; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Trip Invitation!</h1>
            </div>
            <div style="padding: 40px; text-align: center;">
              <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Hi there,</p>
              <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 30px;">
                <b>${senderName}</b> has invited you to explore and collaborate on an amazing trip to <b>${tripTitle}</b>.
              </p>
              <a href="${inviteLink}" style="display: inline-block; padding: 16px 32px; background-color: #0EA5A4; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; transition: all 0.3s ease;">View Trip Details</a>
              <p style="margin-top: 35px; font-size: 13px; color: #999999;">If the button doesn't work, copy-paste this link into your browser:<br/> ${inviteLink}</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="font-size: 12px; color: #aaaaaa; margin: 0;">&copy; 2026 Travelee. Explore the world together.</p>
            </div>
          </div>
        </div>
      `,
    });

    if (friendId) {
      io.to(friendId).emit("receive-invite", {
        senderName,
        senderEmail,
        tripId,
        tripTitle,
      });
    }

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully!",
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
app.use("/api/wishlist", wishlistRoutes);
app.use("/itinerary", itineraryWeatherRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/admin", adminRoutes);
app.use('/api', dealRoutes);
app.use("/api/trip", getAllTrips);
app.use('/api/chat', chatRoutes);

app.get("/", (req, res) => {
  res.send("Travelee Server is running with Real-time Engine...");
});

server.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});

module.exports = app;

