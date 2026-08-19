const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createOrderRules,
  myOrdersListRules,
  orderIdParamRules,
  commerceOrdersListRules,
  deliveryOrdersListRules,
} = require('../validators/order.validator');
const {
  createOrder,
  getMyOrders,
  getMyOrderDetail,
  getCommerceOrders,
  getCommerceOrderDetail,
  assignDeliveryAutomatically,
  getDeliveryOrders,
  getDeliveryOrderDetail,
  completeOrder,
} = require('../controllers/order.controller');

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

// ==========================================================
// Endpoints para Commerce (Rol 2)
// ==========================================================

/**
 * @openapi
 * tags:
 *   - name: Orders (Commerce)
 *     description: Commerce order endpoints (Rol 2)
 *
 * /api/orders/commerce:
 *   get:
 *     tags: [Orders (Commerce)]
 *     summary: Get commerce orders
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
 *       200: { description: Paginated list of the commerce's orders }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get(
  '/commerce',
  authorize('Commerce'),
  commerceOrdersListRules,
  validate,
  getCommerceOrders
);

/**
 * @openapi
 * /api/orders/commerce/{id}:
 *   get:
 *     tags: [Orders (Commerce)]
 *     summary: Get commerce order detail
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order detail }
 *       404: { description: Order not found }
 */
router.get(
  '/commerce/:id',
  authorize('Commerce'),
  orderIdParamRules,
  validate,
  getCommerceOrderDetail
);

/**
 * @openapi
 * /api/orders/{id}/assign-delivery:
 *   patch:
 *     tags: [Orders (Commerce)]
 *     summary: Assign delivery automatically
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Delivery assigned, order moved to InProgress }
 *       400: { description: Order is not Pending }
 *       404: { description: Order not found }
 *       409: { description: No delivery available }
 */
router.patch(
  '/:id/assign-delivery',
  authorize('Commerce'),
  orderIdParamRules,
  validate,
  assignDeliveryAutomatically
);

// ==========================================================
// Endpoints para Delivery (Rol 2)
// ==========================================================

/**
 * @openapi
 * tags:
 *   - name: Orders (Delivery)
 *     description: Delivery order endpoints (Rol 2)
 *
 * /api/orders/delivery:
 *   get:
 *     tags: [Orders (Delivery)]
 *     summary: Get delivery orders
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
 *       200: { description: Paginated list of the delivery's assigned orders }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get(
  '/delivery',
  authorize('Delivery'),
  deliveryOrdersListRules,
  validate,
  getDeliveryOrders
);

/**
 * @openapi
 * /api/orders/delivery/{id}:
 *   get:
 *     tags: [Orders (Delivery)]
 *     summary: Get delivery order detail
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order detail (address hidden once Completed) }
 *       404: { description: Order not found }
 */
router.get(
  '/delivery/:id',
  authorize('Delivery'),
  orderIdParamRules,
  validate,
  getDeliveryOrderDetail
);

/**
 * @openapi
 * /api/orders/{id}/complete:
 *   patch:
 *     tags: [Orders (Delivery)]
 *     summary: Complete order
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order completed, delivery becomes available }
 *       400: { description: Order is not InProgress }
 *       404: { description: Order not found }
 */
router.patch('/:id/complete', authorize('Delivery'), orderIdParamRules, validate, completeOrder);

module.exports = router;
