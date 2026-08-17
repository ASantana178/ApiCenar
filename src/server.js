const app = require('./app');
const config = require('./config/env');
const connectDatabase = require('./config/database');

async function start() {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      console.log(`[ApiCenar] ${config.nodeEnv} → http://localhost:${config.port}`);
      console.log(`[ApiCenar] Swagger → http://localhost:${config.port}/api-docs`);
    });
  } catch (err) {
    console.error('[ApiCenar] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
