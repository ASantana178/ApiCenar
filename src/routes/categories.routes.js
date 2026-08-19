const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  listCategoriesRules,
  categoryIdParamRules,
  createCategoryRules,
  updateCategoryRules,
} = require('../validators/category.validator');
const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

const router = express.Router();

router.use(authenticate, authorize('Commerce'));

/**
 * @openapi
 * tags:
 *   - name: Categories
 *     description: Commerce category management (Rol 2)
 *
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get my categories
 *     security: [{ bearerAuth: [] }]
 *     parameters:
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
 *       200: { description: Paginated list of the commerce's categories }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', listCategoriesRules, validate, listCategories);

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by id
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category detail }
 *       404: { description: Category not found }
 */
router.get('/:id', categoryIdParamRules, validate, getCategoryById);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Category created }
 *       400: { description: Bad request }
 */
router.post('/', createCategoryRules, validate, createCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Category updated }
 *       400: { description: Bad request }
 *       404: { description: Category not found }
 */
router.put('/:id', updateCategoryRules, validate, updateCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Category deleted }
 *       404: { description: Category not found }
 *       409: { description: Category has products assigned }
 */
router.delete('/:id', categoryIdParamRules, validate, deleteCategory);

module.exports = router;
