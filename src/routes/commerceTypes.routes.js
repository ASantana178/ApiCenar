const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { listCommerceTypesRules } = require('../validators/catalog.validator');
const { listCommerceTypes } = require('../controllers/catalog.controller');

const router = express.Router();

router.use(authenticate, authorize('Client'));

/**
 * @openapi
 * tags:
 *   - name: Client Catalog
 *     description: Commerce catalog browsing for the Client role (Rol 3)
 *
 * /api/commerce-types:
 *   get:
 *     tags: [Client Catalog]
 *     summary: Get commerce types
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, createdAt] }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Paginated list of commerce types }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', listCommerceTypesRules, validate, listCommerceTypes);

module.exports = router;
