window.APP_CONFIG = window.APP_CONFIG || {};

const localOverride =
  typeof window !== 'undefined'
    ? window.localStorage?.getItem('API_BASE_URL_OVERRIDE')
    : null;

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const defaultApiBaseUrl = isLocalhost
  ? 'http://localhost:3333/api/v1'
  : '/api/v1';

window.APP_CONFIG.API_BASE_URL = localOverride || defaultApiBaseUrl;
console.log('NEVA Pro API Base URL:', window.APP_CONFIG.API_BASE_URL);
