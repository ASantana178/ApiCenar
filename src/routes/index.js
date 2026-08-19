const express = require('express');

// Registra los modelos reales de Rol 3 (Address/Favorite/Category/Product/Order)
// ANTES que admin.routes (que carga models/shared para dashboard/cascada). Los
// helpers `defineX()` de shared.js sólo definen un stub si Mongoose no tiene ya
// un modelo compilado con ese nombre; registrando los reales primero, shared.js
// termina devolviendo estos mismos modelos en vez de sus stubs, y se evita el
// OverwriteModelError de Mongoose por doble compilación del mismo nombre.
require('../models');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const adminRoutes = require('./admin.routes');
const configurationsRoutes = require('./configurations.routes');
const commerceTypesRoutes = require('./commerce-types.routes');

// Rol 3
const ordersRoutes = require('./orders.routes');
const addressesRoutes = require('./addresses.routes');
const favoritesRoutes = require('./favorites.routes');
const commerceRoutes = require('./commerce.routes');
// commerceTypes.routes.js (Rol 3, GET /commerce-types con JWT + rol Client) no se
// monta: Rol 1 ya expone GET /commerce-types público (sin auth, requerido por el
// formulario de registro de comercios) en el mismo path. El archivo queda en el
// repo por si ese endpoint necesita restringirse a Client más adelante.

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/admin', adminRoutes);
router.use('/configurations', configurationsRoutes);
router.use('/commerce-types', commerceTypesRoutes);

router.use('/orders', ordersRoutes);
router.use('/addresses', addressesRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/commerce', commerceRoutes);

// Placeholders Rol 2 (montar cuando implementen)
// router.use('/categories', categoriesRoutes);
// router.use('/products', productsRoutes);

module.exports = router;
