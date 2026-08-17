const mongoose = require('mongoose');
const { Schema } = mongoose;

const commerceTypeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    icon: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommerceType', commerceTypeSchema);
