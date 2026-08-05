/**
 * User Model - Simplified
 * Handles authentication and roles
 */

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['officer', 'expert', 'citizen'], 
    required: true,
    default: 'citizen'
  },
  isVerifiedExpert: { type: Boolean, default: false },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },
  district: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });



// Compare password
UserSchema.methods.comparePassword = async function(password) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(password, this.passwordHash);
};

// Generate JWT
UserSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model("User", UserSchema);