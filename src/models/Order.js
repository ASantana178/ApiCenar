const mongoose = require('mongoose');
const { Schema } = mongoose;

// Estados oficiales del pedido (no se contempla Canceled).
const ORDER_STATUSES = ['Pending', 'InProgress', 'Completed'];

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    // Snapshot de nombre/precio al momento de crear el pedido (no depende de cambios futuros del producto).
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema(
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
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    // Asignado por Rol 2 (assign-delivery). Null mientras el pedido esté Pending.
    delivery: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    itbisPercentage: { type: Number, required: true, min: 0 },
    itbisAmount: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

orderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
