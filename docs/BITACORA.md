# Bitácora ApiCenar

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
- Puerto por defecto: `4000`

## 2026-08-17 — Rol 1 completo (Auth / Account / Admin / Config / Commerce Types)

Según documento ApiCenar:

- Auth: login, register-client/delivery/commerce, confirm-email, forgot/reset password
- Account: GET/PATCH `/api/account/me`
- Admin: dashboard, users (clients/deliveries/commerces/admins), status
- Configurations: list/get/update (ITBIS)
- Commerce Types admin: CRUD + hard delete en cascada
- Swagger en `/api-docs`
- Modelos mínimos Order/Category/Product/Favorite para métricas y cascada (Rol 2/3 los amplían)
