const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';

function getMongoUri() {
  if (nodeEnv === 'qa') {
    return process.env.MONGODB_URI_QA;
  }
  return process.env.MONGODB_URI_DEV;
}

const config = {
  nodeEnv,
  port: Number(process.env.PORT) || 4000,
  mongoUri: getMongoUri(),
  appUrl: process.env.APP_URL || `http://localhost:${Number(process.env.PORT) || 4000}`,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'ApiCenar <noreply@apicenar.local>',
  },
};

module.exports = config;
