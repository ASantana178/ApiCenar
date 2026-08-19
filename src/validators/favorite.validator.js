const { body, param, query } = require('express-validator');

const listFavoritesRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const addFavoriteRules = [
  body('commerceId').isMongoId().withMessage('commerceId must be a valid id'),
];

const removeFavoriteRules = [param('commerceId').isMongoId()];

module.exports = { listFavoritesRules, addFavoriteRules, removeFavoriteRules };
