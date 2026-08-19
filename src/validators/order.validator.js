const { body, param, query } = require('express-validator');

// ---- Reglas de Client (Rol 3) ----

const createOrderRules = [
  body('addressId').isMongoId().withMessage('addressId must be a valid id'),
  body('items').isArray({ min: 1 }).withMessage('items must contain at least one product'),
  body('items.*.productId').isMongoId().withMessage('items.productId must be a valid id'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('items.quantity must be an integer greater than 0')
    .toInt(),
];

const myOrdersListRules = [
  query('status').optional().isIn(['Pending', 'InProgress', 'Completed']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'total', 'status']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

const orderIdParamRules = [param('id').isMongoId()];

// ---- Reglas de Commerce / Delivery (Rol 2) ----

const commerceOrdersListRules = [
  query('status').optional().isIn(['Pending', 'InProgress', 'Completed']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'total', 'status']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

const deliveryOrdersListRules = [
  query('status').optional().isIn(['Pending', 'InProgress', 'Completed']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'total', 'status']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

module.exports = {
  createOrderRules,
  myOrdersListRules,
  orderIdParamRules,
  commerceOrdersListRules,
  deliveryOrdersListRules,
};
