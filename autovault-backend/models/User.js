const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "normal"
    },

    // ============ SECURITY ENHANCEMENTS ============

    // Password Security
    passwordHistory: [{
      password: String,
      changedAt: { type: Date, default: Date.now }
    }],
    passwordLastChangedAt: {
      type: Date,
      default: Date.now
    },

    // Two-Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String, // For TOTP-based 2FA (future enhancement)
    otpCode: String, // Current OTP code
    otpExpiry: Date, // OTP expiration time
    otpVerified: {
      type: Boolean,
      default: false
    },

    // Account Status & Security
    accountStatus: {
      type: String,
      enum: ['active', 'disabled', 'suspended'],
      default: 'active'
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    accountLockedUntil: Date,

    // Session & Login Tracking
    lastLoginAt: Date,
    lastLoginIP: String,

    // Profile Image
    profilePic: String
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ accountStatus: 1 });

// Method to check if account is locked
UserSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Method to increment failed login attempts
UserSchema.methods.incrementLoginAttempts = function () {
  // If previous lock has expired, restart count
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { accountLockedUntil: 1 }
    });
  }

  // Otherwise increment
  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account after 5 failed attempts for 1 hour
  if (this.failedLoginAttempts + 1 >= 5) {
    updates.$set = { accountLockedUntil: Date.now() + 3600000 }; // 1 hour
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { accountLockedUntil: 1 }
  });
};

module.exports = mongoose.model("User", UserSchema);
