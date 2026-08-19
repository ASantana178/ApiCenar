const express = require('express');
const configurationsController = require('../controllers/configurations.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  configKey,
  updateConfiguration,
} = require('../validators/admin.validators');

const router = express.Router();

router.use(authenticate, authorize('Admin'));

/**
 * @openapi
 * tags:
 *   - name: Configurations
 *     description: System configurations / ITBIS (Rol 1 Admin)
 */

/**
 * @openapi
 * /api/configurations:
 *   get:
 *     tags: [Configurations]
 *     security: [{ bearerAuth: [] }]
 *     summary: List configurations
 */
router.get('/', configurationsController.list);

/**
 * @openapi
 * /api/configurations/{key}:
 *   get:
 *     tags: [Configurations]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get configuration by key
 *   put:
 *     tags: [Configurations]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update configuration by key
 */
router.get('/:key', configKey, validate, configurationsController.getByKey);
router.put(
  '/:key',
  configKey,
  updateConfiguration,
  validate,
  configurationsController.updateByKey
);

module.exports = router;
