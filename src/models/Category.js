const mongoose = require('mongoose');
const { Schema } = mongoose;

// Categorías de producto, administradas por el commerce dueño (CRUD: Rol 2).
// Se modela aquí porque el catálogo de cliente (Rol 3) agrupa productos por categoría.
const categorySchema = new Schema(
  {
    commerce: {
      type: Schema.Types.ObjectId,
      ref: 'Commerce',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
