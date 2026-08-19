const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  listFavoritesRules,
  addFavoriteRules,
  removeFavoriteRules,
} = require('../validators/favorite.validator');
const { listMyFavorites, addFavorite, removeFavorite } = require('../controllers/favorite.controller');

const router = express.Router();

router.use(authenticate, authorize('Client'));

/**
 * @openapi
 * tags:
 *   - name: Favorites
 *     description: Client favorite commerces (Rol 3)
 *
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Get my favorites
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated list of favorite commerces }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *   post:
 *     tags: [Favorites]
 *     summary: Add favorite
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Favorite created }
 *       400: { description: Bad request }
 *       404: { description: Commerce not found }
 *       409: { description: Commerce already in favorites }
 */
router.get('/', listFavoritesRules, validate, listMyFavorites);
router.post('/', addFavoriteRules, validate, addFavorite);

/**
 * @openapi
 * /api/favorites/{commerceId}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove favorite
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Favorite removed }
 *       404: { description: Favorite not found }
 */
router.delete('/:commerceId', removeFavoriteRules, validate, removeFavorite);

module.exports = router;
