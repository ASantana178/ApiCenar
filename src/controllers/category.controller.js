const Category = require('../models/Category');
const Product = require('../models/Product');
const Commerce = require('../models/Commerce');
const { parsePagination, parseSort, escapeRegex, buildPageResult } = require('../utils/helpers');

// Resuelve el documento Commerce ligado al usuario autenticado (role: 'Commerce').
async function getOwnCommerce(req) {
  return Commerce.findOne({ user: req.user._id }).lean();
}

async function listCategories(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'createdAt');

    const filter = { commerce: commerce._id };
    if (req.query.search) {
      filter.name = { $regex: escapeRegex(req.query.search), $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      Category.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      Category.countDocuments(filter),
    ]);

    const categoryIds = docs.map((c) => c._id);
    const counts = await Product.aggregate([
      { $match: { category: { $in: categoryIds } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countByCategory = new Map(counts.map((c) => [String(c._id), c.count]));

    const items = docs.map((category) => ({
      id: category._id,
      name: category.name,
      description: category.description,
      productsCount: countByCategory.get(String(category._id)) || 0,
      createdAt: category.createdAt,
    }));

    res.json(buildPageResult(items, total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      commerce: commerce._id,
    }).lean();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productsCount = await Product.countDocuments({ category: category._id });

    res.json({
      id: category._id,
      name: category.name,
      description: category.description,
      productsCount,
      createdAt: category.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const category = await Category.create({
      commerce: commerce._id,
      name: req.body.name,
      description: req.body.description,
    });

    res.status(201).json({
      id: category._id,
      name: category.name,
      description: category.description,
      productsCount: 0,
      createdAt: category.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      commerce: commerce._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = req.body.name;
    category.description = req.body.description;
    await category.save();

    res.json({
      id: category._id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      commerce: commerce._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return res.status(409).json({
        message: 'Cannot delete a category that has products assigned to it',
        productsCount,
      });
    }

    await category.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOwnCommerce,
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
