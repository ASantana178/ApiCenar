const { body, param } = require('express-validator');

const createAdmin = [
  body('firstName').trim().notEmpty().withMessage('firstName is required'),
  body('lastName').trim().notEmpty().withMessage('lastName is required'),
  body('userName').trim().notEmpty().withMessage('userName is required'),
  body('email').trim().isEmail().withMessage('email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('password and confirmPassword must match'),
  body('phone').trim().notEmpty().withMessage('phone is required'),
];

const updateAdmin = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('userName').optional().trim().notEmpty(),
  body('email').optional().trim().isEmail(),
  body('phone').optional().trim().notEmpty(),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters'),
  body('confirmPassword')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (!req.body.password) return true;
      return value === req.body.password;
    })
    .withMessage('password and confirmPassword must match'),
];

const updateStatus = [
  body('isActive')
    .customSanitizer((v) => {
      if (v === true || v === 'true') return true;
      if (v === false || v === 'false') return false;
      return v;
    })
    .isBoolean()
    .withMessage('isActive must be boolean'),
];

const configKey = [
  param('key').trim().notEmpty().withMessage('key is required'),
];

const updateConfiguration = [
  body('value').notEmpty().withMessage('value is required'),
];

const commerceTypeBody = [
  body('name').trim().notEmpty().withMessage('name is required'),
];

const commerceTypeUpdateBody = [
  body('name').optional({ checkFalsy: true }).trim().notEmpty().withMessage('name cannot be empty'),
];

module.exports = {
  createAdmin,
  updateAdmin,
  updateStatus,
  configKey,
  updateConfiguration,
  commerceTypeBody,
  commerceTypeUpdateBody,
};
