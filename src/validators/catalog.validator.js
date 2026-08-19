const { query, param } = require('express-validator');

const listCommerceTypesRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('sortBy').optional().isIn(['name', 'createdAt']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

const listCommercesRules = [
  query('commerceTypeId').optional().isMongoId(),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['name', 'createdAt']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

const commerceCatalogRules = [param('commerceId').isMongoId()];

module.exports = {
  listCommerceTypesRules,
  listCommercesRules,
  commerceCatalogRules,
};
