const { body, param, query } = require('express-validator');

const addressIdParamRules = [param('id').isMongoId()];

const listAddressesRules = [
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['label', 'city', 'createdAt']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

const createAddressRules = [
  body('label').isString().trim().notEmpty().withMessage('label is required'),
  body('street').isString().trim().notEmpty().withMessage('street is required'),
  body('sector').isString().trim().notEmpty().withMessage('sector is required'),
  body('city').isString().trim().notEmpty().withMessage('city is required'),
  body('reference').isString().trim().notEmpty().withMessage('reference is required'),
];

const updateAddressRules = [...addressIdParamRules, ...createAddressRules];

module.exports = {
  addressIdParamRules,
  listAddressesRules,
  createAddressRules,
  updateAddressRules,
};
