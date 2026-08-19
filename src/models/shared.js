const mongoose = require('mongoose');

/**
 * Modelos mínimos usados por Rol 1 (dashboard + cascada de CommerceType).
 * Rol 2 / Rol 3 ampliarán estos esquemas en sus módulos.
 */

function getModel(name) {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
}

function defineOrder() {
  if (getModel('Order')) return mongoose.model('Order');
  const { Schema } = mongoose;
  const orderSchema = new Schema(
    {
      client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      commerce: { type: Schema.Types.ObjectId, ref: 'Commerce', required: true, index: true },
      delivery: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
      status: {
        type: String,
        enum: ['Pending', 'InProgress', 'Completed'],
        default: 'Pending',
        index: true,
      },
    },
    { timestamps: true, strict: false }
  );
  return mongoose.model('Order', orderSchema);
}

function defineCategory() {
  if (getModel('Category')) return mongoose.model('Category');
  const { Schema } = mongoose;
  const categorySchema = new Schema(
    {
      commerce: { type: Schema.Types.ObjectId, ref: 'Commerce', required: true, index: true },
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true, default: '' },
    },
    { timestamps: true, strict: false }
  );
  return mongoose.model('Category', categorySchema);
}

function defineProduct() {
  if (getModel('Product')) return mongoose.model('Product');
  const { Schema } = mongoose;
  const productSchema = new Schema(
    {
      commerce: { type: Schema.Types.ObjectId, ref: 'Commerce', required: true, index: true },
      category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true, default: '' },
      price: { type: Number, required: true, min: 0 },
      image: { type: String, default: null },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true, strict: false }
  );
  return mongoose.model('Product', productSchema);
}

function defineFavorite() {
  if (getModel('Favorite')) return mongoose.model('Favorite');
  const { Schema } = mongoose;
  const favoriteSchema = new Schema(
    {
      client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      commerce: { type: Schema.Types.ObjectId, ref: 'Commerce', required: true, index: true },
    },
    { timestamps: true }
  );
  favoriteSchema.index({ client: 1, commerce: 1 }, { unique: true });
  return mongoose.model('Favorite', favoriteSchema);
}

module.exports = {
  Order: defineOrder(),
  Category: defineCategory(),
  Product: defineProduct(),
  Favorite: defineFavorite(),
};
