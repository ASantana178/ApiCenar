const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('Admin'));

router.get('/', (_req, res) => {
  res.status(501).json({ message: 'Configurations pending — Rol 1 next step' });
});

router.get('/:key', (_req, res) => {
  res.status(501).json({ message: 'Configurations pending — Rol 1 next step' });
});

router.put('/:key', (_req, res) => {
  res.status(501).json({ message: 'Configurations pending — Rol 1 next step' });
});

module.exports = router;
