const { body } = require('express-validator');

const login = [
  body('userNameOrEmail').trim().notEmpty().withMessage('userNameOrEmail is required'),
  body('password').notEmpty().withMessage('password is required'),
];

const registerPerson = [
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

const registerCommerce = [
  body('userName').trim().notEmpty().withMessage('userName is required'),
  body('email').trim().isEmail().withMessage('email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('password and confirmPassword must match'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').optional({ nullable: true }).trim(),
  body('phone').trim().notEmpty().withMessage('phone is required'),
  body('openingTime').trim().notEmpty().withMessage('openingTime is required'),
  body('closingTime').trim().notEmpty().withMessage('closingTime is required'),
  body('commerceTypeId').trim().notEmpty().withMessage('commerceTypeId is required'),
];

const confirmEmail = [
  body('token').trim().notEmpty().withMessage('token is required'),
];

const forgotPassword = [
  body('userNameOrEmail').trim().notEmpty().withMessage('userNameOrEmail is required'),
];

const resetPassword = [
  body('token').trim().notEmpty().withMessage('token is required'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('password and confirmPassword must match'),
];

module.exports = {
  login,
  registerPerson,
  registerCommerce,
  confirmEmail,
  forgotPassword,
  resetPassword,
};
