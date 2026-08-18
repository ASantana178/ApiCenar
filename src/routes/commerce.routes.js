const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { listCommercesRules, commerceCatalogRules } = require('../validators/catalog.validator');
const { listCommerces, getCommerceCatalog } = require('../controllers/catalog.controller');

const router = express.Router();

router.use(authenticate, authorize('Client'));

/**
 * @openapi
 * /api/commerce:
 *   get:
 *     tags: [Client Catalog]
 *     summary: Get commerces by type
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: commerceTypeId
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, createdAt] }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Paginated list of active commerces }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', listCommercesRules, validate, listCommerces);

/**
 * @openapi
 * /api/commerce/{commerceId}/catalog:
 *   get:
 *     tags: [Client Catalog]
 *     summary: Get commerce catalog grouped by category
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: commerceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Catalog grouped by category }
 *       404: { description: Commerce not found }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/:commerceId/catalog', commerceCatalogRules, validate, getCommerceCatalog);

module.exports = router;
