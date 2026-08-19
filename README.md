# ApiCenar

Repositorio: https://github.com/ASantana178/ApiCenar

API REST del proyecto final ITLA (pedidos / delivery).  
Proyecto **separado** de la web `AppCenar`.

## Stack

- Node.js + Express (MVC)
- MongoDB + Mongoose
- JWT Bearer
- Swagger (`/api-docs`)
- express-validator, Multer, Nodemailer
- dotenv + cross-env (`development` / `qa`)

## Arranque rápido

```bash
cd C:\Users\adnersantana\source\repos\ApiCenar
npm install
copy .env.example .env
# Rellena EMAIL_USER / EMAIL_PASS de Mailtrap
npm run db:up
npm run seed
npm run dev
```

- API: http://localhost:4000/api/health  
- Swagger: http://localhost:4000/api-docs  
- Tipos públicos: http://localhost:4000/api/commerce-types  

Admin seed: `admin@apicenar.local` / `Admin123!`

## Rol 1 (tu parte) — endpoints

| Área | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/login`, `register-client`, `register-delivery`, `register-commerce`, `GET|POST /api/auth/confirm-email`, `forgot-password`, `reset-password` |
| Account | `GET|PATCH /api/account/me` |
| Admin | dashboard, users (clients/deliveries/commerces/admins), status, commerce-types CRUD |
| Config | `GET/PUT /api/configurations`, `GET /api/configurations/:key` |
| Público | `GET /api/commerce-types` (para registro de comercios) |

## División por rol

| Rol | Módulos API |
|-----|-------------|
| **Rol 1 (tú)** | Auth, Account, Admin, Configurations, Commerce Types |
| **Rol 2** | Categories, Products, Orders (commerce/delivery) |
| **Rol 3** | Catalog client, Addresses, Favorites, Orders (client) |

## Convenciones

- Rutas, modelos y JSON en **inglés**
- Roles: `Admin`, `Client`, `Delivery`, `Commerce`
- Header: `Authorization: Bearer {token}`
- Listados: `page`, `pageSize`, `search`, `sortBy`, `sortDirection`
- Bases distintas: `apicenar_dev` / `apicenar_qa`
