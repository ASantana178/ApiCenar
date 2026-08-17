const mongoose = require('mongoose');
const { Schema } = mongoose;

// Roles en inglés (convención ApiCenar)
const ROLES = ['Admin', 'Client', 'Delivery', 'Commerce'];

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ROLES,
      required: true,
      index: true,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    profileImage: { type: String, default: null },

    // Delivery availability
    isAvailable: { type: Boolean, default: true },

    isActive: { type: Boolean, default: false, index: true },
    activationToken: { type: String, default: null },
    activationTokenExpires: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },

    // Default system admin cannot be edited/deactivated
    isDefaultAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
