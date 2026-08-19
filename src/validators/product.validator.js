const { body, param, query } = require('express-validator');

const listProductsRules = [
  query('categoryId').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

const productIdParamRules = [param('id').isMongoId().withMessage('id must be a valid id')];

const createProductRules = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('price')
    .notEmpty()
    .withMessage('price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('price must be a number greater than or equal to 0')
    .toFloat(),
  body('categoryId').isMongoId().withMessage('categoryId must be a valid id'),
];

// En edición la imagen es opcional; los demás campos se mantienen requeridos
// para no dejar un producto a medio editar con valores vacíos.
const updateProductRules = [
  param('id').isMongoId().withMessage('id must be a valid id'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('price')
    .notEmpty()
    .withMessage('price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('price must be a number greater than or equal to 0')
    .toFloat(),
  body('categoryId').isMongoId().withMessage('categoryId must be a valid id'),
];

module.exports = {
  listProductsRules,
  productIdParamRules,
  createProductRules,
  updateProductRules,
};
