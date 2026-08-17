# ApiCenar

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
npm run db:up
npm run seed
npm run dev
```

- API: http://localhost:4000/api/health  
- Swagger: http://localhost:4000/api-docs  

Admin seed: `admin@apicenar.local` / `Admin123!`

## Estructura

```text
ApiCenar/
├── src/
│   ├── config/       # env, database, swagger
│   ├── models/       # User, Commerce, CommerceType, Configuration
│   ├── controllers/
│   ├── routes/       # /api/auth, /account, /admin, /configurations
│   ├── middleware/   # JWT, validate, upload
│   ├── services/     # token, mail
│   ├── validators/
│   ├── utils/
│   ├── seeds/
│   ├── app.js
│   └── server.js
├── uploads/
├── .env
└── package.json
```

## División por rol

| Rol | Módulos API |
|-----|-------------|
| **Rol 1 (tú)** | Auth, Account, Admin, Configurations, Commerce Types (admin) |
| **Rol 2** | Categories, Products, Orders (commerce/delivery) |
| **Rol 3** | Catalog client, Addresses, Favorites, Orders (client) |

## Convenciones

- Rutas, modelos y JSON en **inglés**
- Roles: `Admin`, `Client`, `Delivery`, `Commerce`
- Header: `Authorization: Bearer {token}`
- Listados: `page`, `pageSize`, `search`, `sortBy`, `sortDirection`
- Bases distintas: `apicenar_dev` / `apicenar_qa`

## Estado actual

Scaffold listo: servidor, Mongo, modelos core, JWT middleware, Swagger base, rutas montadas (stubs 501), seed.

Siguiente paso Rol 1: implementar Auth JWT completo.
