const proxyToBackend = require('../../_proxy');

module.exports = async (req, res) => {
  const pathSegments = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
      ? [req.query.path]
      : [];

  return proxyToBackend(req, res, pathSegments);
};
