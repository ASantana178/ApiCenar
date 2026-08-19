const { body } = require('express-validator');

const updateProfile = [
  body('firstName').optional({ nullable: true }).trim().notEmpty(),
  body('lastName').optional({ nullable: true }).trim().notEmpty(),
  body('phone').optional({ nullable: true }).trim().notEmpty(),
  body('email').optional({ nullable: true }).trim().isEmail(),
  body('openingTime').optional({ nullable: true }).trim().notEmpty(),
  body('closingTime').optional({ nullable: true }).trim().notEmpty(),
  body('name').optional({ nullable: true }).trim().notEmpty(),
  body('description').optional({ nullable: true }).trim(),
  body('commerceTypeId').optional({ nullable: true }).trim().notEmpty(),
];

module.exports = { updateProfile };
