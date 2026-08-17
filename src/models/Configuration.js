const mongoose = require('mongoose');
const { Schema } = mongoose;

const configurationSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    value: { type: String, required: true },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

configurationSchema.statics.getItbisPercentage = async function getItbisPercentage() {
  const doc = await this.findOne({ key: 'ITBIS' }).lean();
  if (!doc) return 18;
  const n = Number(doc.value);
  return Number.isFinite(n) ? n : 18;
};

module.exports = mongoose.model('Configuration', configurationSchema);
