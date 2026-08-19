const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadProduct } = require('../middleware/upload');
const {
  listProductsRules,
  productIdParamRules,
  createProductRules,
  updateProductRules,
} = require('../validators/product.validator');
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');

const router = express.Router();

router.use(authenticate, authorize('Commerce'));

/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Commerce product management (Rol 2)
 *
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get my products
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: categoryId
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
 *         schema: { type: string }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Paginated list of the commerce's products }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', listProductsRules, validate, listProducts);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product detail }
 *       404: { description: Product not found }
 */
router.get('/:id', productIdParamRules, validate, getProductById);

/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, categoryId, image]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               categoryId: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Product created }
 *       400: { description: Bad request }
 */
router.post('/', uploadProduct.single('image'), createProductRules, validate, createProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, description, price, categoryId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               categoryId: { type: string }
 *               image: { type: string, format: binary, description: 'Optional on update' }
 *     responses:
 *       200: { description: Product updated }
 *       400: { description: Bad request }
 *       404: { description: Product not found }
 */
router.put('/:id', uploadProduct.single('image'), updateProductRules, validate, updateProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Product deleted }
 *       404: { description: Product not found }
 */
router.delete('/:id', productIdParamRules, validate, deleteProduct);

module.exports = router;
