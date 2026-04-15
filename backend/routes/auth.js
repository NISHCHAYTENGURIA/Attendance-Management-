/**
 * Authentication API Routes
 * Register, Login, and User Management
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
// MIDDLEWARE
// ============================================================

/** Verify JWT Token */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ============================================================
// HELPERS
// ============================================================

/** Generate JWT Token */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ============================================================
// ENDPOINTS
// ============================================================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', rollNumber, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, teacher, or admin'
      });
    }

    // Create user (password hashing done in User model)
    const user = await User.create({
      name,
      email,
      password,
      role,
      rollNumber: role === 'student' ? rollNumber : undefined,
      department
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.getProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

/**
 * PUT /api/auth/update
 * Update user profile
 */
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { name, department, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(department && { department }),
        ...(avatar && { avatar })
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token deletion)
 */
router.post('/logout', verifyToken, (req, res) => {
  // Token invalidation is handled client-side by deleting the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;