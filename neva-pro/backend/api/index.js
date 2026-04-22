let cachedHandler;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    const { createApp } = require('../dist/app.factory');
    const app = await createApp();
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance();
  }

  return cachedHandler(req, res);
};
