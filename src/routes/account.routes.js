const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/me', (_req, res) => {
  res.status(501).json({ message: 'Account module pending — Rol 1 next step' });
});

router.patch('/me', (_req, res) => {
  res.status(501).json({ message: 'Account module pending — Rol 1 next step' });
});

module.exports = router;
