const mongoose = require('mongoose');
const { Schema } = mongoose;

// Direcciones del cliente (Rol 3)
const addressSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    sector: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    reference: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', addressSchema);
