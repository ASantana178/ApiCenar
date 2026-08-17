/**
 * Seed inicial — Rol 1
 * Crea: admin por defecto, configuración ITBIS, tipos de comercio de prueba.
 *
 * Uso: npm run seed
 */

const bcrypt = require('bcryptjs');

const config = require('../config/env');
const connectDatabase = require('../config/database');
const User = require('../models/User');
const Configuration = require('../models/Configuration');
const CommerceType = require('../models/CommerceType');

const ADMIN_EMAIL = 'admin@apicenar.local';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

const COMMERCE_TYPES = [
  { name: 'Restaurant', icon: '/uploads/commerce-types/restaurant.png' },
  { name: 'Supermarket', icon: '/uploads/commerce-types/supermarket.png' },
  { name: 'Pharmacy', icon: '/uploads/commerce-types/pharmacy.png' },
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
    const exists = await CommerceType.findOne({ name: item.name });
    if (exists) {
      console.log('[seed] Commerce type exists:', item.name);
      continue;
    }
    await CommerceType.create(item);
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
