const mongoose = require('mongoose');

const CommerceType = require('../models/CommerceType');
const Commerce = require('../models/Commerce');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Favorite = require('../models/Favorite');
const { parsePagination, parseSort, escapeRegex, buildPageResult } = require('../utils/helpers');

async function listCommerceTypes(req, res, next) {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'name');

    const filter = {};
    if (req.query.search) {
      filter.name = { $regex: escapeRegex(req.query.search), $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      CommerceType.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      CommerceType.countDocuments(filter),
    ]);

    const items = docs.map((doc) => ({
      id: doc._id,
      name: doc.name,
      icon: doc.icon,
    }));

    res.json(buildPageResult(items, total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function listCommerces(req, res, next) {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'name');
    const { commerceTypeId, search } = req.query;

    const match = {};
    if (commerceTypeId) {
      match.commerceType = new mongoose.Types.ObjectId(commerceTypeId);
    }
    if (search) {
      match.name = { $regex: escapeRegex(search), $options: 'i' };
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      { $match: { 'userDoc.isActive': true } },
      {
        $facet: {
          data: [{ $sort: sort }, { $skip: skip }, { $limit: pageSize }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await Commerce.aggregate(pipeline);
    const docs = result?.data || [];
    const total = result?.totalCount?.[0]?.count || 0;

    let favoriteIds = new Set();
    if (docs.length) {
      const favorites = await Favorite.find({
        client: req.user._id,
        commerce: { $in: docs.map((d) => d._id) },
      })
        .select('commerce')
        .lean();
      favoriteIds = new Set(favorites.map((f) => String(f.commerce)));
    }

    const items = docs.map((doc) => ({
      id: doc._id,
      name: doc.name,
      description: doc.description,
      phone: doc.phone,
      openingTime: doc.openingTime,
      closingTime: doc.closingTime,
      logo: doc.logo,
      commerceTypeId: doc.commerceType,
      isFavorite: favoriteIds.has(String(doc._id)),
    }));

    res.json(buildPageResult(items, total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function getCommerceCatalog(req, res, next) {
  try {
    const { commerceId } = req.params;

    const commerce = await Commerce.findById(commerceId).populate('user', 'isActive').lean();
    if (!commerce || !commerce.user?.isActive) {
      return res.status(404).json({ message: 'Commerce not found' });
    }

    const [categories, products] = await Promise.all([
      Category.find({ commerce: commerceId }).sort({ name: 1 }).lean(),
      Product.find({ commerce: commerceId, isActive: true }).sort({ name: 1 }).lean(),
    ]);

    const categoriesResult = categories.map((category) => ({
      id: category._id,
      name: category.name,
      description: category.description,
      products: products
        .filter((product) => String(product.category) === String(category._id))
        .map((product) => ({
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
        })),
    }));

    res.json({
      commerceId: commerce._id,
      commerceName: commerce.name,
      logo: commerce.logo,
      categories: categoriesResult,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCommerceTypes, listCommerces, getCommerceCatalog };
