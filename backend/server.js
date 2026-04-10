// ============================================================
// 📁 backend/server.js
// Main entry point — Express server yahan se start hota hai
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// .env file se environment variables load karo
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json()); // JSON body parse karne ke liye

// --- Routes Register karo ---
const attendanceRoutes = require("./routes/attendance");
const authRoutes = require("./routes/auth");

app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);

// --- Health Check Route ---
app.get("/api/health", (req, res) => {
  res.json({ status: "Server chal raha hai! 🚀", timestamp: new Date() });
});

// --- MongoDB se Connect karo ---
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/attendance_db")
  .then(() => {
    console.log("✅ MongoDB se connection ho gaya!");
    app.listen(PORT, () => {
      console.log(`🚀 Server port ${PORT} pe chal raha hai`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection fail:", err.message);
    process.exit(1);
  });

module.exports = app;
