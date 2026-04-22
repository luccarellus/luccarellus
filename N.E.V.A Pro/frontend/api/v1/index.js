const proxyToBackend = require('../_proxy');

module.exports = async (req, res) => proxyToBackend(req, res);
