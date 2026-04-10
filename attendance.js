// ============================================================
// 📁 backend/routes/attendance.js
// Yahan saare API endpoints define hain
// JWT se authentication verify hoti hai
// ============================================================

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Attendance = require("../models/Attendance");

// --- JWT Middleware: Token check karo har protected route pe ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token nahi mila, access denied!" });
  }

  try {
    // Token ko decode karo aur user info nikalo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalid ya expire ho gaya!" });
  }
};

// --- Role-based access: Sirf teachers aur admins mark kar sakte hain ---
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Yeh kaam sirf ${roles.join("/")} kar sakte hain!`,
      });
    }
    next();
  };
};

// ============================================================
// GET /attendance/:studentId
// Student ka poora attendance summary fetch karo
// ============================================================
router.get("/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Student sirf apna data dekh sakta hai, teacher/admin sab dekh sakte hain
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ message: "Dusre student ka data nahi dekh sakte!" });
    }

    // Static method se summary nikalo (model mein define hai)
    const summary = await Attendance.getStudentSummary(studentId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Attendance fetch mein error:", error);
    res.status(500).json({ message: "Server error aa gaya!", error: error.message });
  }
});

// ============================================================
// POST /mark-attendance
// Teacher class ka attendance mark karega
// Body: { studentId, subject, semester, status, date?, remarks? }
// ============================================================
router.post("/mark-attendance", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { studentId, subject, semester, status, date, remarks } = req.body;

    // Basic validation
    if (!studentId || !subject || !semester || !status) {
      return res.status(400).json({ message: "Sab fields bharo bhai!" });
    }

    // Valid status check
    if (!["present", "absent", "late"].includes(status)) {
      return res.status(400).json({ message: "Status sirf present/absent/late ho sakta hai!" });
    }

    // Is student-subject combo ka record dhundo, nahi mila toh naaya banao
    let attendance = await Attendance.findOne({ studentId, subject, semester });

    if (!attendance) {
      // Pehli baar is subject ka attendance aa raha hai
      attendance = new Attendance({ studentId, subject, semester, records: [] });
    }

    // Naya record add karo array mein
    attendance.records.push({
      date: date ? new Date(date) : new Date(),
      status,
      subject,
      markedBy: req.user.id, // Logged-in teacher ka ID
      remarks: remarks || "",
    });

    // Save karo — pre-save hook automatically percentage recalculate karega
    await attendance.save();

    res.status(201).json({
      success: true,
      message: "Attendance mark ho gayi!",
      data: {
        studentId,
        subject,
        totalClasses: attendance.totalClasses,
        classesAttended: attendance.classesAttended,
        attendancePercentage: attendance.attendancePercentage,
        isBelowThreshold: attendance.isBelowThreshold,
      },
    });
  } catch (error) {
    console.error("Attendance mark karne mein error:", error);
    res.status(500).json({ message: "Server ne dhoka de diya!", error: error.message });
  }
});

// ============================================================
// GET /attendance/class/:subject/:semester
// Teacher ke liye: Puri class ka attendance ek saath
// ============================================================
router.get("/class/:subject/:semester", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const { subject, semester } = req.params;

    const classData = await Attendance.find({ subject, semester })
      .populate("studentId", "name rollNumber email") // Student details bhi lao
      .lean();

    // 75% se kam waale students alag karo — yeh warning list hai
    const atRisk = classData.filter((d) => d.isBelowThreshold);

    res.json({
      success: true,
      data: {
        totalStudents: classData.length,
        atRiskCount: atRisk.length,
        records: classData,
        atRiskStudents: atRisk,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Class data nahi mila!", error: error.message });
  }
});

module.exports = router;
