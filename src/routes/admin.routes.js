const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('Admin'));

router.get('/dashboard', (_req, res) => {
  res.status(501).json({ message: 'Admin dashboard pending — Rol 1 next step' });
});

router.get('/users/clients', (_req, res) => {
  res.status(501).json({ message: 'Admin users pending — Rol 1 next step' });
});

router.get('/users/deliveries', (_req, res) => {
  res.status(501).json({ message: 'Admin users pending — Rol 1 next step' });
});

router.get('/users/commerces', (_req, res) => {
  res.status(501).json({ message: 'Admin users pending — Rol 1 next step' });
});

router.get('/users/admins', (_req, res) => {
  res.status(501).json({ message: 'Admin users pending — Rol 1 next step' });
});

router.post('/users/admins', (_req, res) => {
  res.status(501).json({ message: 'Admin users pending — Rol 1 next step' });
});

router.put('/users/admins/:id', (_req, res) => {
  res.status(501).json({ message: 'Admin users pending — Rol 1 next step' });
});

router.patch('/users/:id/status', (_req, res) => {
  res.status(501).json({ message: 'Admin users pending — Rol 1 next step' });
});

router.get('/commerce-types', (_req, res) => {
  res.status(501).json({ message: 'Commerce types pending — Rol 1 next step' });
});

router.get('/commerce-types/:id', (_req, res) => {
  res.status(501).json({ message: 'Commerce types pending — Rol 1 next step' });
});

router.post('/commerce-types', (_req, res) => {
  res.status(501).json({ message: 'Commerce types pending — Rol 1 next step' });
});

router.put('/commerce-types/:id', (_req, res) => {
  res.status(501).json({ message: 'Commerce types pending — Rol 1 next step' });
});

router.delete('/commerce-types/:id', (_req, res) => {
  res.status(501).json({ message: 'Commerce types pending — Rol 1 next step' });
});

module.exports = router;
