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
window.APP_CONFIG.GOOGLE_CLIENT_ID =
  window.localStorage?.getItem('GOOGLE_CLIENT_ID_OVERRIDE') ||
  '401742216274-ft674rtsvo06f0ck08qrn8og521o21ps.apps.googleusercontent.com';
window.APP_CONFIG.APPLE_CLIENT_ID =
  window.localStorage?.getItem('APPLE_CLIENT_ID_OVERRIDE') || '';
const appleRedirectOverride = window.localStorage?.getItem('APPLE_REDIRECT_URI_OVERRIDE') || '';
window.APP_CONFIG.APPLE_REDIRECT_URI =
  appleRedirectOverride ||
  (window.location?.origin?.startsWith('https://')
    ? `${window.location.origin}/login.html`
    : '');
console.log('NEVA Pro API Base URL:', window.APP_CONFIG.API_BASE_URL);
