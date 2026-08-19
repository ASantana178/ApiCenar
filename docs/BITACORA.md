# Bitácora ApiCenar

## 2026-08-17 — Scaffold inicial (Rol 1)

- Proyecto nuevo en `C:\Users\adnersantana\source\repos\ApiCenar`
- Express MVC + Mongo + JWT middleware + Swagger UI
- Modelos: `User`, `Commerce`, `CommerceType`, `Configuration`
- Rutas montadas (stubs): Auth, Account, Admin, Configurations
- Seed: admin por defecto, ITBIS 18%, tipos de comercio de prueba
- Puerto por defecto: `4000` (para no chocar con AppCenar en `3000`)

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
