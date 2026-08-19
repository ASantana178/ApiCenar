/**
 * Seed inicial — Rol 1
 * Crea: admin por defecto, configuración ITBIS, tipos de comercio de prueba.
 *
 * Uso: npm run seed
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const config = require('../config/env');
const connectDatabase = require('../config/database');
const User = require('../models/User');
const Configuration = require('../models/Configuration');
const CommerceType = require('../models/CommerceType');

const ADMIN_EMAIL = 'admin@apicenar.local';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <rect width="128" height="128" fill="#d8efe4"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#0d4f35" font-family="sans-serif" font-size="14">ApiCenar</text>
</svg>`;

function ensureIcon(relativePath) {
  const abs = path.join(process.cwd(), relativePath.replace(/^\//, ''));
  const dir = path.dirname(abs);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(abs)) fs.writeFileSync(abs, PLACEHOLDER_SVG, 'utf8');
  return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
}

const COMMERCE_TYPES = [
  { name: 'Restaurant', icon: '/uploads/commerce-types/restaurant.svg' },
  { name: 'Supermarket', icon: '/uploads/commerce-types/supermarket.svg' },
  { name: 'Pharmacy', icon: '/uploads/commerce-types/pharmacy.svg' },
];

async function seedAdmin() {
  const existing = await User.findOne({
    $or: [{ email: ADMIN_EMAIL }, { isDefaultAdmin: true }],
  });

  if (existing) {
    console.log('[seed] Default admin already exists:', existing.email);
    return existing;
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await User.create({
    role: 'Admin',
    firstName: 'System',
    lastName: 'Administrator',
    userName: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: hash,
    phone: '8090000000',
    isActive: true,
    isDefaultAdmin: true,
  });

  console.log('[seed] Admin created:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  return admin;
}

async function seedItbis() {
  const existing = await Configuration.findOne({ key: 'ITBIS' });
  if (existing) {
    console.log('[seed] ITBIS already exists:', existing.value + '%');
    return existing;
  }

  const itbis = await Configuration.create({
    key: 'ITBIS',
    value: '18',
    description: 'ITBIS tax percentage',
  });

  console.log('[seed] ITBIS created: 18%');
  return itbis;
}

async function seedCommerceTypes() {
  for (const item of COMMERCE_TYPES) {
    const icon = ensureIcon(item.icon);
    const exists = await CommerceType.findOne({ name: item.name });
    if (exists) {
      if (exists.icon !== icon) {
        exists.icon = icon;
        await exists.save();
      }
      console.log('[seed] Commerce type exists:', item.name);
      continue;
    }
    await CommerceType.create({ name: item.name, icon });
    console.log('[seed] Commerce type created:', item.name);
  }
}

async function run() {
  console.log('[seed] Environment:', config.nodeEnv);
  console.log('[seed] Mongo URI:', config.mongoUri);

  await connectDatabase();
  await seedAdmin();
  await seedItbis();
  await seedCommerceTypes();

  console.log('[seed] Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
