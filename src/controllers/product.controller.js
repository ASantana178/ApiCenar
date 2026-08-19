const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { getOwnCommerce } = require('./category.controller');
const { parsePagination, parseSort, escapeRegex, buildPageResult } = require('../utils/helpers');

function toPublicPath(file) {
  if (!file) return null;
  // uploadProduct guarda en <cwd>/uploads/products/<filename>
  return `/uploads/products/${file.filename}`;
}

function removeUploadedFile(file) {
  if (!file) return;
  fs.unlink(file.path, () => {});
}

async function assertCategoryBelongsToCommerce(categoryId, commerceId) {
  const category = await Category.findOne({ _id: categoryId, commerce: commerceId }).lean();
  return category;
}

async function listProducts(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'createdAt');

    const filter = { commerce: commerce._id };
    if (req.query.categoryId) {
      filter.category = req.query.categoryId;
    }
    if (req.query.search) {
      filter.name = { $regex: escapeRegex(req.query.search), $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .populate('category', 'name')
        .lean(),
      Product.countDocuments(filter),
    ]);

    const items = docs.map((product) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      isActive: product.isActive,
      category: product.category
        ? { id: product.category._id, name: product.category.name }
        : null,
      createdAt: product.createdAt,
    }));

    res.json(buildPageResult(items, total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const product = await Product.findOne({ _id: req.params.id, commerce: commerce._id })
      .populate('category', 'name')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      isActive: product.isActive,
      category: product.category
        ? { id: product.category._id, name: product.category.name }
        : null,
      createdAt: product.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      removeUploadedFile(req.file);
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'image is required' });
    }

    const category = await assertCategoryBelongsToCommerce(req.body.categoryId, commerce._id);
    if (!category) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: 'categoryId must belong to your commerce' });
    }

    const product = await Product.create({
      commerce: commerce._id,
      category: category._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: toPublicPath(req.file),
    });

    res.status(201).json({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      isActive: product.isActive,
      categoryId: product.category,
      createdAt: product.createdAt,
    });
  } catch (err) {
    removeUploadedFile(req.file);
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      removeUploadedFile(req.file);
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const product = await Product.findOne({ _id: req.params.id, commerce: commerce._id });
    if (!product) {
      removeUploadedFile(req.file);
      return res.status(404).json({ message: 'Product not found' });
    }

    const category = await assertCategoryBelongsToCommerce(req.body.categoryId, commerce._id);
    if (!category) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: 'categoryId must belong to your commerce' });
    }

    const previousImagePath = product.image
      ? path.join(process.cwd(), product.image.replace(/^\//, ''))
      : null;

    product.name = req.body.name;
    product.description = req.body.description;
    product.price = req.body.price;
    product.category = category._id;
    if (req.file) {
      product.image = toPublicPath(req.file);
    }
    await product.save();

    // Solo se borra la imagen anterior una vez la nueva quedó guardada con éxito.
    if (req.file && previousImagePath && fs.existsSync(previousImagePath)) {
      fs.unlink(previousImagePath, () => {});
    }

    res.json({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      isActive: product.isActive,
      categoryId: product.category,
      createdAt: product.createdAt,
    });
  } catch (err) {
    removeUploadedFile(req.file);
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const product = await Product.findOne({ _id: req.params.id, commerce: commerce._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imagePath = product.image
      ? path.join(process.cwd(), product.image.replace(/^\//, ''))
      : null;

    await product.deleteOne();

    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlink(imagePath, () => {});
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
