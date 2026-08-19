const { body, param, query } = require('express-validator');

const listCategoriesRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('sortBy').optional().isIn(['name', 'createdAt']),
  query('sortDirection').optional().isIn(['asc', 'desc']),
];

const categoryIdParamRules = [param('id').isMongoId().withMessage('id must be a valid id')];

const createCategoryRules = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
];

const updateCategoryRules = [
  param('id').isMongoId().withMessage('id must be a valid id'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
];

module.exports = {
  listCategoriesRules,
  categoryIdParamRules,
  createCategoryRules,
  updateCategoryRules,
};
