const express = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const adminRoutes = require('./admin.routes');
const configurationsRoutes = require('./configurations.routes');

// Rol 3
const ordersRoutes = require('./orders.routes');
const addressesRoutes = require('./addresses.routes');
const favoritesRoutes = require('./favorites.routes');
const commerceRoutes = require('./commerce.routes');
const clientCommerceTypesRoutes = require('./commerceTypes.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/admin', adminRoutes);
router.use('/configurations', configurationsRoutes);

router.use('/orders', ordersRoutes);
router.use('/addresses', addressesRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/commerce', commerceRoutes);
router.use('/commerce-types', clientCommerceTypesRoutes);

// Placeholders Rol 2 (montar cuando implementen)
// router.use('/categories', categoriesRoutes);
// router.use('/products', productsRoutes);

module.exports = router;
