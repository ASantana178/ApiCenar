const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadCommerceType } = require('../middleware/upload');
const {
  createAdmin,
  updateAdmin,
  commerceTypeBody,
  commerceTypeUpdateBody,
} = require('../validators/admin.validators');

const router = express.Router();

router.use(authenticate, authorize('Admin'));

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin dashboard, users and commerce types (Rol 1)
 */

router.get('/dashboard', adminController.dashboard);

router.get('/users/clients', adminController.getClients);
router.get('/users/deliveries', adminController.getDeliveries);
router.get('/users/commerces', adminController.getCommerces);
router.get('/users/admins', adminController.getAdmins);
router.post('/users/admins', createAdmin, validate, adminController.createAdmin);
router.put('/users/admins/:id', updateAdmin, validate, adminController.updateAdmin);
router.patch(
  '/users/:id/status',
  body('isActive')
    .customSanitizer((v) => {
      if (v === true || v === 'true') return true;
      if (v === false || v === 'false') return false;
      return v;
    })
    .isBoolean()
    .withMessage('isActive must be boolean'),
  validate,
  adminController.updateUserStatus
);

router.get('/commerce-types', adminController.listCommerceTypes);
router.get('/commerce-types/:id', adminController.getCommerceType);
router.post(
  '/commerce-types',
  uploadCommerceType.single('icon'),
  commerceTypeBody,
  validate,
  adminController.createCommerceType
);
router.put(
  '/commerce-types/:id',
  uploadCommerceType.single('icon'),
  commerceTypeUpdateBody,
  validate,
  adminController.updateCommerceType
);
router.delete('/commerce-types/:id', adminController.deleteCommerceType);

module.exports = router;
