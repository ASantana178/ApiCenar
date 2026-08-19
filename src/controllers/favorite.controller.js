const Favorite = require('../models/Favorite');
const Commerce = require('../models/Commerce');
const { parsePagination, buildPageResult } = require('../utils/helpers');

async function listMyFavorites(req, res, next) {
  try {
    const { page, pageSize, skip } = parsePagination(req.query);

    const filter = { client: req.user._id };
    const [docs, total] = await Promise.all([
      Favorite.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('commerce', 'name description phone logo openingTime closingTime commerceType')
        .lean(),
      Favorite.countDocuments(filter),
    ]);

    const items = docs
      .filter((fav) => fav.commerce)
      .map((fav) => ({
        favoriteId: fav._id,
        commerceId: fav.commerce._id,
        name: fav.commerce.name,
        description: fav.commerce.description,
        phone: fav.commerce.phone,
        logo: fav.commerce.logo,
        openingTime: fav.commerce.openingTime,
        closingTime: fav.commerce.closingTime,
        commerceTypeId: fav.commerce.commerceType,
        createdAt: fav.createdAt,
      }));

    res.json(buildPageResult(items, total, page, pageSize));
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    const { commerceId } = req.body;

    const commerce = await Commerce.findById(commerceId).populate('user', 'isActive').lean();
    if (!commerce || !commerce.user?.isActive) {
      return res.status(404).json({ message: 'Commerce not found' });
    }

    const existing = await Favorite.findOne({ client: req.user._id, commerce: commerceId });
    if (existing) {
      return res.status(409).json({ message: 'Commerce is already in favorites' });
    }

    const favorite = await Favorite.create({ client: req.user._id, commerce: commerceId });
    res.status(201).json({
      favoriteId: favorite._id,
      commerceId: favorite.commerce,
      createdAt: favorite.createdAt,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Commerce is already in favorites' });
    }
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const favorite = await Favorite.findOneAndDelete({
      client: req.user._id,
      commerce: req.params.commerceId,
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyFavorites, addFavorite, removeFavorite };
