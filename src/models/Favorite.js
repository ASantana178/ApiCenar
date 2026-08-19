const mongoose = require('mongoose');
const { Schema } = mongoose;

// Comercios favoritos de un cliente (Rol 3)
const favoriteSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    commerce: {
      type: Schema.Types.ObjectId,
      ref: 'Commerce',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ client: 1, commerce: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
