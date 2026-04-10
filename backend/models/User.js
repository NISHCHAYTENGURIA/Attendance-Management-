// ============================================================
// 📁 backend/models/User.js
// Student, Teacher, Admin — teeno ka schema yahi hai
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    // Teen type ke users hain system mein
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    rollNumber: { type: String }, // Sirf students ke liye
    department: { type: String },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Password ko save karne se pehle hash kar do — security ke liye zaroori!
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Login ke time password compare karo
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);


// ============================================================
// 📁 backend/routes/auth.js (Combined for brevity)
// Login aur register endpoints yahan hain
// ============================================================

// Export above as User model — auth routes below in separate file
// backend/routes/auth.js:

/*
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token generate karne ka helper function
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 din tak valid rahega token
  );
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Email ya password galat hai!' });
  }
  const token = generateToken(user);
  res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, rollNumber, department } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered hai!' });
  const user = await User.create({ name, email, password, role, rollNumber, department });
  const token = generateToken(user);
  res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
});

module.exports = router;
*/
