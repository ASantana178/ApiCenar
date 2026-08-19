const mongoose = require('mongoose');
const { Schema } = mongoose;

// Productos de un commerce (CRUD: Rol 2).
// Se modela aquí porque el catálogo y la creación de pedidos de cliente (Rol 3) los consultan.
const productSchema = new Schema(
  {
    commerce: {
      type: Schema.Types.ObjectId,
      ref: 'Commerce',
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
