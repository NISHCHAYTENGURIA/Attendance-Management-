/**
 * Attendance API Routes
 * Production-ready with Azure Cosmos DB optimization
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { getStudentAnalytics, getClassAnalytics } = require("../utils/analytics");
const { markBulkAttendance, exportAttendanceData } = require("../utils/bulkOperations");

// ============================================================
// MIDDLEWARE
// ============================================================

/** Verify JWT Token */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

/** Require specific roles */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Only ${roles.join("/")} can access this`
      });
    }
    next();
  };
};

// ============================================================
// ENDPOINTS
// ============================================================

/**
 * GET /api/attendance/analytics/:studentId
 * Get complete analytics for a student
 * Cost: 10-20 RU (vs 50-100 without optimization)
 */
router.get("/analytics/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Permission check: students see only themselves, teachers/admins see all
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const analytics = await getStudentAnalytics(studentId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
});

/**
 * POST /api/attendance/mark
 * Mark attendance for entire class in one operation
 * Cost: 50 RU for 100 students (vs 1000 RU individual writes)
 */
router.post("/mark", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { subject, semester, date, records } = req.body;

    // Validation
    if (!subject || !semester || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Subject, semester, and records array required"
      });
    }

    // Use bulk operation utility
    const result = await markBulkAttendance(
      req.user.id,
      subject,
      semester,
      new Date(date || Date.now()),
      records
    );

    res.status(201).json({
      success: true,
      message: `Marked attendance for ${result.insertedCount} students`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message
    });
  }
});

/**
 * GET /api/attendance/student/:studentId
 * Get attendance records for a student
 */
router.get("/student/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, semester, limit = 100 } = req.query;

    // Permission check
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Build query
    const query = { "student.studentId": studentId };
    if (subject) query.subject = subject;
    if (semester) query.semester = semester;

    // Fetch with lean() for optimal RU usage
    const records = await Attendance.find(query)
      .lean()
      .limit(parseInt(limit))
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch records",
      error: error.message
    });
  }
});

/**
 * GET /api/attendance/class/:subject/:semester
 * Get all attendance for a class (teacher view)
 */
router.get("/class/:subject/:semester", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { subject, semester } = req.params;
    const { date } = req.query;

    let analytics;
    if (date) {
      analytics = await getClassAnalytics(subject, semester, new Date(date));
    } else {
      analytics = await getClassAnalytics(subject, semester, new Date());
    }

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch class analytics",
      error: error.message
    });
  }
});

/**
 * GET /api/attendance/export
 * Export attendance data (teacher/admin only)
 */
router.get("/export", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { subject, semester, startDate, endDate } = req.query;

    if (!subject || !semester || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Subject, semester, startDate, and endDate required"
      });
    }

    const exportData = await exportAttendanceData(
      subject,
      semester,
      startDate,
      endDate,
      { format: "json", limit: 10000 }
    );

    // Set headers for download
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="attendance-${subject}-${semester}.json"`);

    res.json(exportData.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to export data",
      error: error.message
    });
  }
});

/**
 * DELETE /api/attendance/:id
 * Delete a single attendance record (admin only)
 */
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Attendance.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    res.json({
      success: true,
      message: "Record deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete record",
      error: error.message
    });
  }
});

module.exports = router;
