const express = require('express');
const CommerceType = require('../models/CommerceType');
const { parsePagination, parseSort } = require('../utils/helpers');

const router = express.Router();

/**
 * Public commerce types — needed for register-commerce without admin token.
 */
router.get('/', async (req, res) => {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'name');

    const filter = {};
    if (req.query.search) {
      filter.name = new RegExp(String(req.query.search).trim(), 'i');
    }

    const [docs, total] = await Promise.all([
      CommerceType.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      CommerceType.countDocuments(filter),
    ]);

    return res.status(200).json({
      items: docs.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        icon: d.icon,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    console.error('[commerceTypes.publicList]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
