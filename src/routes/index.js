const express = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const adminRoutes = require('./admin.routes');
const configurationsRoutes = require('./configurations.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/admin', adminRoutes);
router.use('/configurations', configurationsRoutes);

// Placeholders Rol 2 / Rol 3 (montar cuando implementen)
// router.use('/orders', ordersRoutes);
// router.use('/addresses', addressesRoutes);
// router.use('/favorites', favoritesRoutes);
// router.use('/categories', categoriesRoutes);
// router.use('/products', productsRoutes);
// router.use('/commerce', commerceRoutes);
// router.use('/commerce-types', clientCommerceTypesRoutes);

module.exports = router;
