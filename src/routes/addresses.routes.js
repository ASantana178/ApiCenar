const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  addressIdParamRules,
  listAddressesRules,
  createAddressRules,
  updateAddressRules,
} = require('../validators/address.validator');
const {
  listMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/address.controller');

const router = express.Router();

router.use(authenticate, authorize('Client'));

/**
 * @openapi
 * tags:
 *   - name: Addresses
 *     description: Client delivery addresses (Rol 3)
 *
 * /api/addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: Get my addresses
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated list of the client's addresses }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *   post:
 *     tags: [Addresses]
 *     summary: Create address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Address created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/', listAddressesRules, validate, listMyAddresses);
router.post('/', createAddressRules, validate, createAddress);

/**
 * @openapi
 * /api/addresses/{id}:
 *   get:
 *     tags: [Addresses]
 *     summary: Get address by id
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Address found }
 *       404: { description: Address not found }
 *   put:
 *     tags: [Addresses]
 *     summary: Update address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Address updated }
 *       400: { description: Bad request }
 *       404: { description: Address not found }
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Address deleted }
 *       404: { description: Address not found }
 */
router.get('/:id', addressIdParamRules, validate, getAddressById);
router.put('/:id', updateAddressRules, validate, updateAddress);
router.delete('/:id', addressIdParamRules, validate, deleteAddress);

module.exports = router;
