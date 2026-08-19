const Configuration = require('../models/Configuration');
const { parsePagination, parseSort } = require('../utils/helpers');

function toDto(doc) {
  return {
    id: doc._id.toString(),
    key: doc.key,
    value: doc.value,
    description: doc.description,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
  };
}

exports.list = async (req, res) => {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'key');

    const filter = {};
    if (req.query.search) {
      const regex = new RegExp(String(req.query.search).trim(), 'i');
      filter.$or = [{ key: regex }, { description: regex }, { value: regex }];
    }

    const [items, total] = await Promise.all([
      Configuration.find(filter).sort(sort).skip(skip).limit(pageSize),
      Configuration.countDocuments(filter),
    ]);

    return res.status(200).json({
      items: items.map(toDto),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    console.error('[configurations.list]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getByKey = async (req, res) => {
  try {
    const key = String(req.params.key).toUpperCase();
    const doc = await Configuration.findOne({ key });
    if (!doc) {
      return res.status(404).json({ message: 'Configuration not found' });
    }
    return res.status(200).json(toDto(doc));
  } catch (err) {
    console.error('[configurations.getByKey]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateByKey = async (req, res) => {
  try {
    const key = String(req.params.key).toUpperCase();
    const value = String(req.body.value);

    if (key === 'ITBIS') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({ message: 'ITBIS value must be a non-negative number' });
      }
    }

    let doc = await Configuration.findOne({ key });
    if (!doc) {
      return res.status(404).json({ message: 'Configuration not found' });
    }

    doc.value = value;
    if (req.body.description !== undefined) {
      doc.description = req.body.description;
    }
    await doc.save();

    return res.status(200).json(toDto(doc));
  } catch (err) {
    console.error('[configurations.updateByKey]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
