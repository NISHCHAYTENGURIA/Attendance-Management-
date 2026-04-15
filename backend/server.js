// ============================================================
// 📁 backend/server.js
// Main entry point — Express server optimized for Azure Cosmos DB
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const DatabaseConnection = require("./db");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Singleton
const db = new DatabaseConnection();

// --- Middleware Setup ---
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// --- Routes Register ---
const attendanceRoutes = require("./routes/attendance");
const authRoutes = require("./routes/auth");

app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);

// --- Health Check Route with Database Status ---
app.get("/api/health", async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    res.json({
      status: "Server running successfully 🚀",
      database: dbHealth,
      timestamp: new Date(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      database: false,
      error: error.message,
      timestamp: new Date(),
    });
  }
});

// --- Initialize Server with Database Connection ---
async function startServer() {
  try {
    // Connect to Azure Cosmos DB
    await db.connect();
    console.log("✅ Connected to Azure Cosmos DB successfully");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Database: Azure Cosmos DB for MongoDB API`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 CORS Origin: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
