const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    otp: {
      type: String,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    // Optional: Track if OTP was used
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create index on email for faster queries
otpSchema.index({ email: 1 });

// Create TTL index to auto-delete expired documents after they expire
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPModel = mongoose.model("Otp", otpSchema);
module.exports = OTPModel; 