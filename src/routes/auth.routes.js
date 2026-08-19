const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { uploadProfile, uploadLogo } = require('../middleware/upload');
const {
  login,
  registerPerson,
  registerCommerce,
  confirmEmail,
  forgotPassword,
  resetPassword,
} = require('../validators/auth.validators');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Public authentication (Rol 1)
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with username or email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userNameOrEmail, password]
 *             properties:
 *               userNameOrEmail: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad Request }
 *       401: { description: Unauthorized }
 */
router.post('/login', login, validate, authController.login);

/**
 * @openapi
 * /api/auth/register-client:
 *   post:
 *     tags: [Auth]
 *     summary: Register Client (multipart)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, userName, email, password, confirmPassword, phone, profileImage]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               userName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *               phone: { type: string }
 *               profileImage: { type: string, format: binary }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 *       409: { description: Conflict }
 */
router.post(
  '/register-client',
  uploadProfile.single('profileImage'),
  registerPerson,
  validate,
  authController.registerClient
);

/**
 * @openapi
 * /api/auth/register-delivery:
 *   post:
 *     tags: [Auth]
 *     summary: Register Delivery (multipart)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, userName, email, password, confirmPassword, phone, profileImage]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               userName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *               phone: { type: string }
 *               profileImage: { type: string, format: binary }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 *       409: { description: Conflict }
 */
router.post(
  '/register-delivery',
  uploadProfile.single('profileImage'),
  registerPerson,
  validate,
  authController.registerDelivery
);

/**
 * @openapi
 * /api/auth/register-commerce:
 *   post:
 *     tags: [Auth]
 *     summary: Register Commerce (multipart)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [userName, email, password, confirmPassword, name, phone, openingTime, closingTime, commerceTypeId, logo]
 *             properties:
 *               userName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               phone: { type: string }
 *               openingTime: { type: string }
 *               closingTime: { type: string }
 *               commerceTypeId: { type: string }
 *               logo: { type: string, format: binary }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad Request }
 *       409: { description: Conflict }
 */
router.post(
  '/register-commerce',
  uploadLogo.single('logo'),
  registerCommerce,
  validate,
  authController.registerCommerce
);

/**
 * @openapi
 * /api/auth/confirm-email:
 *   get:
 *     tags: [Auth]
 *     summary: Confirm account via email link (query token)
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Confirmed }
 *       400: { description: Invalid or expired }
 *   post:
 *     tags: [Auth]
 *     summary: Confirm account with activation token (JSON body)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200: { description: Confirmed }
 *       400: { description: Invalid or expired }
 */
router.get('/confirm-email', authController.confirmEmailGet);
router.post('/confirm-email', confirmEmail, validate, authController.confirmEmail);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userNameOrEmail]
 *             properties:
 *               userNameOrEmail: { type: string }
 *     responses:
 *       200: { description: Always OK (does not leak existence) }
 */
router.post('/forgot-password', forgotPassword, validate, authController.forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password, confirmPassword]
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Password updated }
 *       400: { description: Invalid token }
 */
router.post('/reset-password', resetPassword, validate, authController.resetPassword);

module.exports = router;
