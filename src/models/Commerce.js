const mongoose = require('mongoose');
const { Schema } = mongoose;

// Perfil de comercio ligado a User (rol Commerce)
const commerceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    phone: { type: String, required: true, trim: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    logo: { type: String, default: null },
    commerceType: {
      type: Schema.Types.ObjectId,
      ref: 'CommerceType',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Commerce', commerceSchema);
