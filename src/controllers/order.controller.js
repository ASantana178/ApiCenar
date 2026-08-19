const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product');
const Commerce = require('../models/Commerce');
const User = require('../models/User');
const Configuration = require('../models/Configuration');
const { parsePagination, parseSort, round2, buildPageResult } = require('../utils/helpers');
const { getOwnCommerce } = require('./category.controller');

// ==========================================================
// Endpoints de Client (Rol 3) — sin modificar
// ==========================================================

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

// ==========================================================
// Endpoints de Commerce (Rol 2)
// ==========================================================

async function getCommerceOrders(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'createdAt');

    const filter = { commerce: commerce._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [docs, total] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      Order.countDocuments(filter),
    ]);

    const items = docs.map((order) => ({
      id: order._id,
      status: order.status,
      total: order.total,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
    }));

    res.json(buildPageResult(items, total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function getCommerceOrderDetail(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const order = await Order.findOne({ _id: req.params.id, commerce: commerce._id })
      .populate('address')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      id: order._id,
      status: order.status,
      address: order.address,
      items: order.items,
      subtotal: order.subtotal,
      itbisPercentage: order.itbisPercentage,
      itbisAmount: order.itbisAmount,
      total: order.total,
      // El comercio solo puede asignar delivery mientras el pedido siga Pending.
      canAssignDelivery: order.status === 'Pending',
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function assignDeliveryAutomatically(req, res, next) {
  try {
    const commerce = await getOwnCommerce(req);
    if (!commerce) {
      return res.status(404).json({ message: 'Commerce profile not found' });
    }

    const order = await Order.findOne({ _id: req.params.id, commerce: commerce._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be assigned to a delivery' });
    }

    // Busca el primer delivery activo y disponible. No usamos transacción de Mongo
    // (no se asume replica set); en su lugar re-verificamos disponibilidad justo
    // antes de guardar para minimizar condiciones de carrera.
    const delivery = await User.findOne({
      role: 'Delivery',
      isActive: true,
      isAvailable: true,
    });

    if (!delivery) {
      return res.status(409).json({ message: 'No delivery is available at the moment' });
    }

    // Re-chequeo: nos aseguramos de que nadie más lo haya tomado justo antes de guardar.
    const stillAvailable = await User.findOneAndUpdate(
      { _id: delivery._id, isAvailable: true },
      { $set: { isAvailable: false } },
      { new: true }
    );

    if (!stillAvailable) {
      return res.status(409).json({ message: 'No delivery is available at the moment' });
    }

    order.delivery = stillAvailable._id;
    order.status = 'InProgress';

    try {
      await order.save();
    } catch (saveErr) {
      // Si falla el guardado del pedido, liberamos al delivery para no dejarlo ocupado en falso.
      await User.updateOne({ _id: stillAvailable._id }, { $set: { isAvailable: true } });
      throw saveErr;
    }

    res.json({
      id: order._id,
      status: order.status,
      deliveryId: order.delivery,
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================================
// Endpoints de Delivery (Rol 2)
// ==========================================================

async function getDeliveryOrders(req, res, next) {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'createdAt');

    const filter = { delivery: req.user._id };
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

async function getDeliveryOrderDetail(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, delivery: req.user._id })
      .populate('commerce', 'name logo phone')
      .populate('address')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const response = {
      id: order._id,
      status: order.status,
      commerce: order.commerce,
      items: order.items,
      subtotal: order.subtotal,
      itbisPercentage: order.itbisPercentage,
      itbisAmount: order.itbisAmount,
      total: order.total,
      createdAt: order.createdAt,
    };

    // Regla de negocio: una vez completado el pedido, el delivery ya no debe
    // ver la dirección de entrega.
    if (order.status !== 'Completed') {
      response.address = order.address;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
}

async function completeOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, delivery: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'InProgress') {
      return res.status(400).json({ message: 'Only in-progress orders can be completed' });
    }

    order.status = 'Completed';
    await order.save();

    await User.updateOne({ _id: req.user._id }, { $set: { isAvailable: true } });

    res.json({
      id: order._id,
      status: order.status,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderDetail,
  getCommerceOrders,
  getCommerceOrderDetail,
  assignDeliveryAutomatically,
  getDeliveryOrders,
  getDeliveryOrderDetail,
  completeOrder,
};
