const express = require('express');
const accountController = require('../controllers/account.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadProfile, uploadLogo } = require('../middleware/upload');
const { updateProfile } = require('../validators/account.validators');

const router = express.Router();

function uploadProfileOrLogo(req, res, next) {
  const role = req.user?.role;
  const uploader =
    role === 'Commerce' ? uploadLogo.single('logo') : uploadProfile.single('profileImage');
  return uploader(req, res, next);
}

router.use(authenticate);

/**
 * @openapi
 * tags:
 *   - name: Account
 *     description: Authenticated profile (Rol 1)
 * /api/account/me:
 *   get:
 *     tags: [Account]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get authenticated profile
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 *   patch:
 *     tags: [Account]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update authenticated profile (multipart optional)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               openingTime: { type: string }
 *               closingTime: { type: string }
 *               commerceTypeId: { type: string }
 *               profileImage: { type: string, format: binary }
 *               logo: { type: string, format: binary }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad Request }
 *       401: { description: Unauthorized }
 *       409: { description: Conflict }
 */
router.get('/me', accountController.getMe);
router.patch(
  '/me',
  uploadProfileOrLogo,
  updateProfile,
  validate,
  accountController.updateMe
);

module.exports = router;
