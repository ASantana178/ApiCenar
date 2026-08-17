const express = require('express');
const { health } = require('../controllers/health.controller');

const router = express.Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is up
 */
router.get('/health', health);

module.exports = router;
