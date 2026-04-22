const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

function getBackendBaseUrl() {
  const baseUrl = process.env.BACKEND_API_URL || process.env.BACKEND_URL;

  if (!baseUrl) {
    throw new Error(
      'Missing BACKEND_API_URL environment variable. Set it in the Vercel frontend project.'
    );
  }

  return baseUrl.replace(/\/+$/, '');
}

function buildTargetUrl(req, pathSegments = []) {
  const incomingUrl = new URL(req.url, 'http://localhost');
  const path = Array.isArray(pathSegments) ? pathSegments.filter(Boolean).join('/') : String(pathSegments || '');
  const suffix = path ? `/${path}` : '';

  return `${getBackendBaseUrl()}${suffix}${incomingUrl.search}`;
}

function forwardHeaders(req) {
  const headers = {};
  const allowList = [
    'accept',
    'authorization',
    'content-type',
    'cookie',
    'user-agent',
    'x-requested-with',
  ];

  for (const key of allowList) {
    const value = req.headers[key];
    if (value) headers[key] = value;
  }

  return headers;
}

function serializeBody(req) {
  if (!req.body) return undefined;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return req.body;
  return JSON.stringify(req.body);
}

module.exports = async function proxyToBackend(req, res, pathSegments = []) {
  try {
    const targetUrl = buildTargetUrl(req, pathSegments);
    const method = (req.method || 'GET').toUpperCase();
    const body = ['GET', 'HEAD'].includes(method) ? undefined : serializeBody(req);

    const backendResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders(req),
      body,
    });

    res.status(backendResponse.status);

    backendResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const arrayBuffer = await backendResponse.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(502).json({
      message: 'Unable to reach backend API.',
    });
  }
};
