# Bitácora ApiCenar

## 2026-08-19 — Merge Rol 3 → ApiCenar_QAS

- `docs/BITACORA.md`, `src/models/index.js`, `src/routes/index.js`: conflictos de
  contenido resueltos combinando ambas ramas (ver detalle abajo, entradas de
  Rol 1 y Rol 3 conservadas).
- `src/models/index.js` ahora exporta los modelos reales (`Address`, `Favorite`,
  `Category`, `Product`, `Order`) en vez del stub `models/shared.js`. `shared.js`
  se deja intacto para `admin.controller.js`: como sus `getModel(name)` sólo
  redefinen un modelo si Mongoose no lo tiene ya compilado, con los modelos
  reales registrados primero (ver siguiente punto) `shared.js` termina
  devolviendo los modelos reales, no los stubs.
- `src/routes/index.js`: se requieren los modelos reales de Rol 3 al inicio del
  archivo, antes de `admin.routes` (que carga `models/shared`), para evitar
  `OverwriteModelError` de Mongoose por orden de carga.
- `GET /api/commerce-types`: Rol 1 ya expone este path público (sin auth, para
  el dropdown de `register-commerce`). No se monta el router de Rol 3
  (`commerceTypes.routes.js`, que exige JWT + rol Client) en el mismo path para
  evitar el choque; el archivo queda en el repo sin montar por si se necesita
  restringir el acceso más adelante.

## 2026-08-19 — Cierre Rol 1 (Auth / Account / Admin / Config)

- Swagger completo Admin + Auth (multipart/JSON) + Configurations
- `GET /api/auth/confirm-email?token=` (link del correo funciona)
- `GET /api/commerce-types` público para registro de comercios
- Account PATCH: commerce name/description/commerceTypeId + email único
- Configurations con paginación/search/sort
- Admin commerce-types PUT con validators; búsqueda de comercios por nombre
- Seed crea iconos SVG; Mailtrap en `.env.example`
- Health message actualizado

## 2026-08-17 — Scaffold inicial (Rol 1)

- Proyecto nuevo en `C:\Users\adnersantana\source\repos\ApiCenar`
- Express MVC + Mongo + JWT middleware + Swagger UI
- Modelos: `User`, `Commerce`, `CommerceType`, `Configuration`
- Seed: admin por defecto, ITBIS 18%, tipos de comercio de prueba
- Puerto por defecto: `4000` (para no chocar con AppCenar en `3000`)

## 2026-08-17 — Rol 1 completo (Auth / Account / Admin / Config / Commerce Types)

Según documento ApiCenar:

- Auth: login, register-client/delivery/commerce, confirm-email, forgot/reset password
- Account: GET/PATCH `/api/account/me`
- Admin: dashboard, users (clients/deliveries/commerces/admins), status
- Configurations: list/get/update (ITBIS)
- Commerce Types admin: CRUD + hard delete en cascada
- Swagger en `/api-docs`
- Modelos mínimos Order/Category/Product/Favorite para métricas y cascada (Rol 2/3 los amplían)

## 2026-08-17 — Módulos Client: Catalog, Addresses, Favorites, Orders (Rol 3)

- Modelos nuevos: `Address`, `Favorite`, `Category`, `Product`, `Order` (los dos
  últimos son consultados por Rol 3 para el catálogo y la creación de pedidos;
  su CRUD de escritura para Commerce lo implementa Rol 2).
- Controladores + rutas implementados:
  - `GET /api/commerce-types` — tipos de comercio para Client.
  - `GET /api/commerce` — comercios activos, filtro por tipo, búsqueda, marca `isFavorite`.
  - `GET /api/commerce/:commerceId/catalog` — catálogo agrupado por categoría (solo productos activos).
  - `GET/POST/PUT/DELETE /api/addresses` — direcciones propias del cliente.
  - `GET/POST/DELETE /api/favorites` — comercios favoritos del cliente.
  - `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/my-orders/:id`
    — creación y consulta de pedidos del cliente (subtotal/ITBIS/total calculados
    con `Configuration.getItbisPercentage()`).
- `routes/orders.routes.js` monta solo los endpoints de Client; Rol 2 debe agregar
  ahí mismo (o en un router separado montado también en `/orders`) los endpoints
  de Commerce y Delivery.
- Validación con `express-validator` en todos los endpoints nuevos.
- Documentación Swagger agregada en cada archivo de rutas nuevo.
- Pendiente para poder probar end-to-end: Auth (Rol 1) y Categories/Products (Rol 2).
