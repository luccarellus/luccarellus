window.APP_CONFIG = window.APP_CONFIG || {};

const localOverride =
  typeof window !== 'undefined'
    ? window.localStorage?.getItem('API_BASE_URL_OVERRIDE')
    : null;

window.APP_CONFIG.API_BASE_URL =
  window.APP_CONFIG.API_BASE_URL ||
  localOverride ||
  'http://localhost:3333/api/v1';
