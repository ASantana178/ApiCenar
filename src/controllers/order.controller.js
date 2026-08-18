const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Commerce = require('../models/Commerce');
const Configuration = require('../models/Configuration');
const { parsePagination, parseSort, round2, buildPageResult } = require('../utils/helpers');

async function createOrder(req, res, next) {
  try {
    const { addressId, items } = req.body;

    const address = await Address.findOne({ _id: addressId, client: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    const products = await Product.find({
      _id: { $in: uniqueProductIds },
      isActive: true,
    }).lean();

    if (products.length !== uniqueProductIds.length) {
      return res.status(404).json({ message: 'One or more products were not found' });
    }

    const commerceIds = new Set(products.map((product) => String(product.commerce)));
    if (commerceIds.size > 1) {
      return res.status(400).json({ message: 'All products must belong to the same commerce' });
    }
    const commerceId = [...commerceIds][0];

    const commerce = await Commerce.findById(commerceId).populate('user', 'isActive').lean();
    if (!commerce || !commerce.user?.isActive) {
      return res.status(404).json({ message: 'Commerce not found' });
    }

    const productById = new Map(products.map((product) => [String(product._id), product]));
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productById.get(item.productId);
      const lineTotal = round2(product.price * item.quantity);
      subtotal = round2(subtotal + lineTotal);
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const itbisPercentage = await Configuration.getItbisPercentage();
    const itbisAmount = round2(subtotal * (itbisPercentage / 100));
    const total = round2(subtotal + itbisAmount);

    const order = await Order.create({
      client: req.user._id,
      commerce: commerceId,
      address: address._id,
      items: orderItems,
      subtotal,
      itbisPercentage,
      itbisAmount,
      total,
      status: 'Pending',
    });

    res.status(201).json({
      id: order._id,
      status: order.status,
      commerceId: order.commerce,
      clientId: order.client,
      addressId: order.address,
      subtotal: order.subtotal,
      itbisPercentage: order.itbisPercentage,
      itbisAmount: order.itbisAmount,
      total: order.total,
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'createdAt');

    const filter = { client: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [docs, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .populate('commerce', 'name logo')
        .lean(),
      Order.countDocuments(filter),
    ]);

    const items = docs.map((order) => ({
      id: order._id,
      status: order.status,
      commerce: order.commerce
        ? { id: order.commerce._id, name: order.commerce.name, logo: order.commerce.logo }
        : null,
      total: order.total,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
    }));

    res.json(buildPageResult(items, total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function getMyOrderDetail(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, client: req.user._id })
      .populate('commerce', 'name logo phone')
      .populate('address')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      id: order._id,
      status: order.status,
      commerce: order.commerce,
      address: order.address,
      items: order.items,
      subtotal: order.subtotal,
      itbisPercentage: order.itbisPercentage,
      itbisAmount: order.itbisAmount,
      total: order.total,
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getMyOrders, getMyOrderDetail };
