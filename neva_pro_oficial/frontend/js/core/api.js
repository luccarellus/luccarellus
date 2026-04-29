/**
 * N.E.V.A Pro - Centralized API Service
 */
import { getApiBaseUrl, showToast } from './utils.js';
import { getSession, handleLogout } from './auth.js';

const DEFAULT_TIMEOUT = 15000; // 15 seconds

/**
 * Common fetch wrapper with auth, timeout and error handling
 */
export async function apiRequest(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    const session = getSession();
    
    // Setup timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);

    // Setup headers
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    // Add Authorization header if session exists
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const config = {
        ...options,
        headers,
        signal: controller.signal
    };

    let retries = options.retries || 0;
    const retryDelay = options.retryDelay || 1000;

    try {
        const url = `${baseUrl}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
        const response = await fetch(url, config);
        
        clearTimeout(timeoutId);

        // Handle unauthorized globally
        if (response.status === 401) {
            showToast('Sessão expirada. Por favor, faça login novamente.', 'warning');
            handleLogout();
            throw new Error('Sessão expirada');
        }

        const data = await readResponse(response);

        if (!response.ok) {
            const errorMsg = data.message || data.error || `Erro na requisição: ${response.statusText}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle Retries
        if (retries > 0 && error.name !== 'AbortError' && error.message !== 'Sessão expirada') {
            console.warn(`API Retry [${endpoint}]: ${retries} attempts left...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return apiRequest(endpoint, { ...options, retries: retries - 1 });
        }

        if (error.name === 'AbortError') {
            const msg = 'A requisição demorou muito e foi cancelada.';
            showToast(msg, 'error');
            throw new Error(msg);
        }

        if (error.message !== 'Sessão expirada') {
            console.error(`API Error [${endpoint}]:`, error);
        }
        throw error;
    }
}

/**
 * Helper to read response as JSON safely
 */
async function readResponse(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

/**
 * Typed API helpers
 */
export const api = {
    get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

