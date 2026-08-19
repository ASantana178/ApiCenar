/**
 * OpenAPI (Swagger) docs for Rol 1 Admin + Configurations.
 * Loaded by swagger-jsdoc via ./src/docs/*.js
 */

/**
 * @openapi
 * tags:
 *   - name: Admin
 *     description: Admin dashboard, users and commerce types (Rol 1)
 *   - name: Configurations
 *     description: System configurations / ITBIS (Rol 1 Admin)
 *   - name: CommerceTypes
 *     description: Public commerce types for registration
 */

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Dashboard metrics
 *     responses:
 *       200:
 *         description: Metrics totals
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @openapi
 * /api/admin/users/clients:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: List clients
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ['true', 'false'] }
 *     responses:
 *       200: { description: Paginated clients }
 */

/**
 * @openapi
 * /api/admin/users/deliveries:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: List deliveries
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ['true', 'false'] }
 *     responses:
 *       200: { description: Paginated deliveries }
 */

/**
 * @openapi
 * /api/admin/users/commerces:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: List commerces
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: isActive
 *         schema: { type: string, enum: ['true', 'false'] }
 *     responses:
 *       200: { description: Paginated commerces }
 */

/**
 * @openapi
 * /api/admin/users/admins:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: List admins
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated admins }
 *   post:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create admin (active immediately)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, userName, email, password, confirmPassword, phone]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               userName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Conflict }
 */

/**
 * @openapi
 * /api/admin/users/admins/{id}:
 *   put:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update admin (cannot edit self or default admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               userName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Forbidden }
 */

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Activate or deactivate a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Updated }
 */

/**
 * @openapi
 * /api/admin/commerce-types:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: List commerce types (admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated commerce types }
 *   post:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create commerce type (multipart)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, icon]
 *             properties:
 *               name: { type: string }
 *               icon: { type: string, format: binary }
 *     responses:
 *       201: { description: Created }
 */

/**
 * @openapi
 * /api/admin/commerce-types/{id}:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get commerce type by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   put:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update commerce type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               icon: { type: string, format: binary }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Hard delete commerce type (cascade)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */

/**
 * @openapi
 * /api/configurations:
 *   get:
 *     tags: [Configurations]
 *     security: [{ bearerAuth: [] }]
 *     summary: List configurations
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortDirection
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Paginated configurations }
 */

/**
 * @openapi
 * /api/configurations/{key}:
 *   get:
 *     tags: [Configurations]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   put:
 *     tags: [Configurations]
 *     security: [{ bearerAuth: [] }]
 *     summary: Update configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [value]
 *             properties:
 *               value: { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Updated }
 */

/**
 * @openapi
 * /api/commerce-types:
 *   get:
 *     tags: [CommerceTypes]
 *     summary: Public list of commerce types (for registration)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated commerce types }
 */
