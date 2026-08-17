const mongoose = require('mongoose');
const config = require('./env');

async function connectDatabase() {
  if (!config.mongoUri) {
    throw new Error(
      'No hay mongoUri configurado. Revisa MONGODB_URI_DEV / MONGODB_URI_QA en .env'
    );
  }

  await mongoose.connect(config.mongoUri);
  console.log(`[MongoDB] Connected. Environment: ${config.nodeEnv}`);
}

module.exports = connectDatabase;
