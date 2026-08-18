const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createOrderRules,
  myOrdersListRules,
  orderIdParamRules,
} = require('../validators/order.validator');
const { createOrder, getMyOrders, getMyOrderDetail } = require('../controllers/order.controller');

const router = express.Router();

router.use(authenticate);

// Endpoints para Client (Rol 3). Rol 2 añade aquí mismo (u otro router montado en
// '/orders' desde routes/index.js) los endpoints de Commerce (/commerce, /commerce/:id,
// /:id/assign-delivery) y Delivery (/delivery, /delivery/:id, /:id/complete).

/**
 * @openapi
 * tags:
 *   - name: Orders (Client)
 *     description: Client order endpoints (Rol 3)
 *
 * /api/orders:
 *   post:
 *     tags: [Orders (Client)]
 *     summary: Create order
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId, items]
 *             properties:
 *               addressId: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: Order created }
 *       400: { description: Bad request }
 *       404: { description: Address or product not found }
 */
router.post('/', authorize('Client'), createOrderRules, validate, createOrder);

/**
 * @openapi
 * /api/orders/my-orders:
 *   get:
 *     tags: [Orders (Client)]
 *     summary: Get my orders
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, InProgress, Completed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Paginated list of the client's orders }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/my-orders', authorize('Client'), myOrdersListRules, validate, getMyOrders);

/**
 * @openapi
 * /api/orders/my-orders/{id}:
 *   get:
 *     tags: [Orders (Client)]
 *     summary: Get my order detail
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order detail }
 *       404: { description: Order not found }
 */
router.get('/my-orders/:id', authorize('Client'), orderIdParamRules, validate, getMyOrderDetail);

module.exports = router;
