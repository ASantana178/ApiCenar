const Address = require('../models/Address');
const { parsePagination, parseSort, escapeRegex, buildPageResult } = require('../utils/helpers');

function toDto(address) {
  return {
    id: address._id,
    label: address.label,
    street: address.street,
    sector: address.sector,
    city: address.city,
    reference: address.reference,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

async function listMyAddresses(req, res, next) {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, 'createdAt');

    const filter = { client: req.user._id };
    if (req.query.search) {
      const regex = { $regex: escapeRegex(req.query.search), $options: 'i' };
      filter.$or = [
        { label: regex },
        { street: regex },
        { sector: regex },
        { city: regex },
        { reference: regex },
      ];
    }

    const [docs, total] = await Promise.all([
      Address.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      Address.countDocuments(filter),
    ]);

    res.json(buildPageResult(docs.map(toDto), total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function getAddressById(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.params.id, client: req.user._id }).lean();
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(toDto(address));
  } catch (err) {
    next(err);
  }
}

async function createAddress(req, res, next) {
  try {
    const { label, street, sector, city, reference } = req.body;
    const address = await Address.create({
      client: req.user._id,
      label,
      street,
      sector,
      city,
      reference,
    });
    res.status(201).json(toDto(address));
  } catch (err) {
    next(err);
  }
}

async function updateAddress(req, res, next) {
  try {
    const { label, street, sector, city, reference } = req.body;
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, client: req.user._id },
      { label, street, sector, city, reference },
      { new: true, runValidators: true }
    ).lean();

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(toDto(address));
  } catch (err) {
    next(err);
  }
}

async function deleteAddress(req, res, next) {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, client: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
