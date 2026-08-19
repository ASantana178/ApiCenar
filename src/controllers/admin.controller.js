const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const Commerce = require('../models/Commerce');
const CommerceType = require('../models/CommerceType');
const { Order, Category, Product, Favorite } = require('../models/shared');
const { parsePagination, parseSort } = require('../utils/helpers');
const { publicUploadPath, deletePublicFile } = require('../utils/files');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildSearchFilter(search, fields) {
  if (!search) return {};
  const regex = new RegExp(String(search).trim(), 'i');
  return { $or: fields.map((f) => ({ [f]: regex })) };
}

async function paginateUsers({ role, query, extraFilter = {}, mapItem }) {
  const { page, pageSize, skip } = parsePagination(query);
  const sort = parseSort(query);
  const searchFilter = buildSearchFilter(query.search, [
    'firstName',
    'lastName',
    'userName',
    'email',
    'phone',
  ]);

  const filter = { role, ...extraFilter, ...searchFilter };

  if (query.isActive === 'true' || query.isActive === 'false') {
    filter.isActive = query.isActive === 'true';
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).sort(sort).skip(skip).limit(pageSize),
  ]);

  const items = await Promise.all(users.map(mapItem));

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

exports.dashboard = async (_req, res) => {
  try {
    const today = startOfToday();

    const [
      ordersTotal,
      ordersToday,
      commercesActive,
      commercesInactive,
      clientsActive,
      clientsInactive,
      deliveriesActive,
      deliveriesInactive,
      productsTotal,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'Commerce', isActive: true }),
      User.countDocuments({ role: 'Commerce', isActive: false }),
      User.countDocuments({ role: 'Client', isActive: true }),
      User.countDocuments({ role: 'Client', isActive: false }),
      User.countDocuments({ role: 'Delivery', isActive: true }),
      User.countDocuments({ role: 'Delivery', isActive: false }),
      Product.countDocuments(),
    ]);

    return res.status(200).json({
      orders: { total: ordersTotal, today: ordersToday },
      commerces: { active: commercesActive, inactive: commercesInactive },
      clients: { active: clientsActive, inactive: clientsInactive },
      deliveries: { active: deliveriesActive, inactive: deliveriesInactive },
      products: { total: productsTotal },
    });
  } catch (err) {
    console.error('[admin.dashboard]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getClients = async (req, res) => {
  try {
    const result = await paginateUsers({
      role: 'Client',
      query: req.query,
      mapItem: async (u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        userName: u.userName,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive,
        ordersCount: await Order.countDocuments({ client: u._id }),
        profileImage: u.profileImage,
      }),
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[admin.getClients]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const result = await paginateUsers({
      role: 'Delivery',
      query: req.query,
      mapItem: async (u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        userName: u.userName,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive,
        isAvailable: u.isAvailable,
        completedOrdersCount: await Order.countDocuments({
          delivery: u._id,
          status: 'Completed',
        }),
        profileImage: u.profileImage,
      }),
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[admin.getDeliveries]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCommerces = async (req, res) => {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query);

    const userFilter = { role: 'Commerce' };
    if (req.query.isActive === 'true' || req.query.isActive === 'false') {
      userFilter.isActive = req.query.isActive === 'true';
    }
    if (req.query.search) {
      const regex = new RegExp(String(req.query.search).trim(), 'i');
      const matchingCommerceUsers = await Commerce.find({ name: regex }).distinct('user');
      userFilter.$or = [
        { userName: regex },
        { email: regex },
        { phone: regex },
        { _id: { $in: matchingCommerceUsers } },
      ];
    }

    const users = await User.find(userFilter).sort(sort).skip(skip).limit(pageSize);
    const total = await User.countDocuments(userFilter);

    const items = await Promise.all(
      users.map(async (u) => {
        const commerce = await Commerce.findOne({ user: u._id }).populate(
          'commerceType',
          'name'
        );
        return {
          id: u._id.toString(),
          userName: u.userName,
          email: u.email,
          phone: u.phone,
          isActive: u.isActive,
          name: commerce?.name || null,
          logo: commerce?.logo || u.profileImage,
          openingTime: commerce?.openingTime || null,
          closingTime: commerce?.closingTime || null,
          commerceType: commerce?.commerceType?.name || null,
          ordersCount: commerce
            ? await Order.countDocuments({ commerce: commerce._id })
            : 0,
        };
      })
    );

    return res.status(200).json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    console.error('[admin.getCommerces]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const result = await paginateUsers({
      role: 'Admin',
      query: req.query,
      mapItem: async (u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        userName: u.userName,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive,
        isDefaultAdmin: u.isDefaultAdmin,
        canEdit: !u.isDefaultAdmin && u._id.toString() !== req.user._id.toString(),
      }),
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[admin.getAdmins]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, userName, email, password, phone } = req.body;

    const existing = await User.findOne({
      $or: [{ userName }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res.status(409).json({ message: 'userName or email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      role: 'Admin',
      firstName,
      lastName,
      userName,
      email: email.toLowerCase(),
      password: hash,
      phone,
      isActive: true,
      isDefaultAdmin: false,
    });

    return res.status(201).json({
      id: admin._id.toString(),
      firstName: admin.firstName,
      lastName: admin.lastName,
      userName: admin.userName,
      email: admin.email,
      phone: admin.phone,
      isActive: admin.isActive,
      role: admin.role,
    });
  } catch (err) {
    console.error('[admin.createAdmin]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    if (id === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot edit your own admin account' });
    }

    const admin = await User.findOne({ _id: id, role: 'Admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Administrator not found' });
    }

    if (admin.isDefaultAdmin) {
      return res.status(403).json({ message: 'Default admin cannot be modified' });
    }

    const { firstName, lastName, userName, email, phone, password } = req.body;

    if (userName || email) {
      const conflict = await User.findOne({
        _id: { $ne: admin._id },
        $or: [
          userName ? { userName } : null,
          email ? { email: email.toLowerCase() } : null,
        ].filter(Boolean),
      });
      if (conflict) {
        return res.status(409).json({ message: 'userName or email already exists' });
      }
    }

    if (firstName !== undefined) admin.firstName = firstName;
    if (lastName !== undefined) admin.lastName = lastName;
    if (userName !== undefined) admin.userName = userName;
    if (email !== undefined) admin.email = email.toLowerCase();
    if (phone !== undefined) admin.phone = phone;
    if (password) admin.password = await bcrypt.hash(password, 10);

    await admin.save();

    return res.status(200).json({
      id: admin._id.toString(),
      firstName: admin.firstName,
      lastName: admin.lastName,
      userName: admin.userName,
      email: admin.email,
      phone: admin.phone,
      isActive: admin.isActive,
      role: admin.role,
    });
  } catch (err) {
    console.error('[admin.updateAdmin]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    if (id === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot change your own status' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isDefaultAdmin) {
      return res.status(403).json({ message: 'Default admin cannot be modified' });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return res.status(200).json({
      id: user._id.toString(),
      role: user.role,
      isActive: user.isActive,
    });
  } catch (err) {
    console.error('[admin.updateUserStatus]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

function mapCommerceType(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    icon: doc.icon,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

exports.listCommerceTypes = async (req, res) => {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'name');
    const filter = {};
    if (req.query.search) {
      filter.name = new RegExp(String(req.query.search).trim(), 'i');
    }

    const [total, items] = await Promise.all([
      CommerceType.countDocuments(filter),
      CommerceType.find(filter).sort(sort).skip(skip).limit(pageSize),
    ]);

    return res.status(200).json({
      items: items.map(mapCommerceType),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    console.error('[admin.listCommerceTypes]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCommerceType = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const doc = await CommerceType.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Commerce type not found' });
    }

    return res.status(200).json(mapCommerceType(doc));
  } catch (err) {
    console.error('[admin.getCommerceType]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createCommerceType = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'icon is required' });
    }

    const name = String(req.body.name || '').trim();
    if (!name) {
      deletePublicFile(publicUploadPath('commerce-types', req.file.filename));
      return res.status(400).json({ message: 'name is required' });
    }

    const exists = await CommerceType.findOne({ name });
    if (exists) {
      deletePublicFile(publicUploadPath('commerce-types', req.file.filename));
      return res.status(409).json({ message: 'Commerce type name already exists' });
    }

    const doc = await CommerceType.create({
      name,
      icon: publicUploadPath('commerce-types', req.file.filename),
    });

    return res.status(201).json(mapCommerceType(doc));
  } catch (err) {
    if (req.file) {
      deletePublicFile(publicUploadPath('commerce-types', req.file.filename));
    }
    console.error('[admin.createCommerceType]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCommerceType = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const doc = await CommerceType.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Commerce type not found' });
    }

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({ message: 'name is required' });
      }
      const exists = await CommerceType.findOne({ name, _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({ message: 'Commerce type name already exists' });
      }
      doc.name = name;
    }

    if (req.file) {
      deletePublicFile(doc.icon);
      doc.icon = publicUploadPath('commerce-types', req.file.filename);
    }

    await doc.save();
    return res.status(200).json(mapCommerceType(doc));
  } catch (err) {
    if (req.file) {
      deletePublicFile(publicUploadPath('commerce-types', req.file.filename));
    }
    console.error('[admin.updateCommerceType]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCommerceType = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const type = await CommerceType.findById(id);
    if (!type) {
      return res.status(404).json({ message: 'Commerce type not found' });
    }

    const commerces = await Commerce.find({ commerceType: type._id });
    const commerceIds = commerces.map((c) => c._id);
    const userIds = commerces.map((c) => c.user);

    if (commerceIds.length) {
      await Order.deleteMany({ commerce: { $in: commerceIds } });
      await Product.deleteMany({ commerce: { $in: commerceIds } });
      await Category.deleteMany({ commerce: { $in: commerceIds } });
      await Favorite.deleteMany({ commerce: { $in: commerceIds } });

      for (const c of commerces) {
        deletePublicFile(c.logo);
      }

      await Commerce.deleteMany({ _id: { $in: commerceIds } });
      await User.deleteMany({ _id: { $in: userIds }, role: 'Commerce' });
    }

    deletePublicFile(type.icon);
    await CommerceType.deleteOne({ _id: type._id });

    return res.status(204).send();
  } catch (err) {
    console.error('[admin.deleteCommerceType]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
