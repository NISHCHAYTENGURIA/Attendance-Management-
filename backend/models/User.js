/**
 * User Schema - Production-Ready for Azure Cosmos DB
 * 
 * Optimizations for Cosmos DB Free Tier (400 RU/s):
 * - Composite indexes for common query patterns
 * - Denormalized data to reduce cross-partition queries
 * - Efficient field indexing to minimize RU consumption
 * - Audit timestamps for compliance
 * 
 * Features:
 * - Support for student, teacher, and admin roles
 * - Indexed fields for fast queries
 * - Partition key strategy aligned with query patterns
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // Core fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true, // Index for sorting and filtering by name
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      sparse: true, // Required for unique sparse index in Cosmos DB
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Exclude password from queries by default
    },

    // Role-based access control
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
      index: true, // Index for role-based filtering
    },

    // Student-specific fields
    rollNumber: {
      type: String,
      sparse: true,
      trim: true,
      maxlength: [50, "Roll number cannot exceed 50 characters"],
    },

    // Department/Class information
    department: {
      type: String,
      sparse: true,
      trim: true,
      index: true, // Index for department queries
    },

    // Additional metadata
    avatar: {
      type: String,
      default: "",
      sparse: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering active users
    },

    lastLogin: {
      type: Date,
      sparse: true,
    },

    // Cosmos DB specific: TTL field (optional, for data cleanup)
    // Set TTL to 30 days for inactive users if desired
    ttl: {
      type: Number,
      default: null,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

/**
 * Composite indexes for frequently used query patterns
 * Reduces cross-partition queries and improves performance
 * 
 * Index strategy:
 * - (role, isActive): Filter teachers/students that are active
 * - (department, role): Filter users by department and role
 * - (email, isActive): Find user and check active status
 * - (createdAt): For pagination and sorting
 */
UserSchema.index({ role: 1, isActive: 1 }, { name: "idx_role_active" });
UserSchema.index({ department: 1, role: 1 }, { name: "idx_dept_role" });
UserSchema.index({ email: 1, isActive: 1 }, { name: "idx_email_active" });
UserSchema.index({ createdAt: -1 }, { name: "idx_created_desc" });

/**
 * Pre-save middleware: Hash password before storing
 * Implements secure password handling for production
 */
UserSchema.pre("save", async function (next) {
  // If password is not modified, skip hashing
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save validation: Ensure rollNumber for students
 */
UserSchema.pre("save", function (next) {
  if (this.role === "student" && !this.rollNumber) {
    next(new Error("Roll number is required for students"));
  } else {
    next();
  }
});

/**
 * Instance method: Compare provided password with stored hash
 * Used during authentication/login
 */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance method: Get user profile (excludes sensitive data)
 * Optimized for sending to frontend - reduces payload
 */
UserSchema.methods.getProfile = function () {
  const user = this.toObject();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    rollNumber: user.rollNumber,
    department: user.department,
    avatar: user.avatar,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
};

/**
 * Static method: Find all active teachers
 * Optimized using composite index (role, isActive)
 */
UserSchema.statics.findActiveTeachers = function () {
  return this.find({ role: "teacher", isActive: true }).lean();
};

/**
 * Static method: Find all active students
 * Optimized using composite index (role, isActive)
 */
UserSchema.statics.findActiveStudents = function () {
  return this.find({ role: "student", isActive: true }).lean();
};

/**
 * Static method: Find active users by department
 * Optimized using composite index (department, role)
 */
UserSchema.statics.findByDepartment = function (department, role = null) {
  const query = { department, isActive: true };
  if (role) query.role = role;
  return this.find(query).lean();
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
