const express = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const adminRoutes = require('./admin.routes');
const configurationsRoutes = require('./configurations.routes');
const commerceTypesRoutes = require('./commerce-types.routes');

// Carga modelos compartidos (Order/Product/Category/Favorite) para dashboard/cascada
require('../models/shared');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/admin', adminRoutes);
router.use('/configurations', configurationsRoutes);
router.use('/commerce-types', commerceTypesRoutes);

module.exports = router;
