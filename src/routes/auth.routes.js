const express = require('express');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Public authentication endpoints (Rol 1)
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login (pending implementation)
 *     responses:
 *       501:
 *         description: Not implemented yet
 */
router.post('/login', (_req, res) => {
  res.status(501).json({ message: 'Auth module pending — Rol 1 next step' });
});

router.post('/register-client', (_req, res) => {
  res.status(501).json({ message: 'Auth module pending — Rol 1 next step' });
});

router.post('/register-delivery', (_req, res) => {
  res.status(501).json({ message: 'Auth module pending — Rol 1 next step' });
});

router.post('/register-commerce', (_req, res) => {
  res.status(501).json({ message: 'Auth module pending — Rol 1 next step' });
});

router.post('/confirm-email', (_req, res) => {
  res.status(501).json({ message: 'Auth module pending — Rol 1 next step' });
});

router.post('/forgot-password', (_req, res) => {
  res.status(501).json({ message: 'Auth module pending — Rol 1 next step' });
});

router.post('/reset-password', (_req, res) => {
  res.status(501).json({ message: 'Auth module pending — Rol 1 next step' });
});

module.exports = router;
