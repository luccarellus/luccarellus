/**
 * N.E.V.A Pro - Authentication & Session Management
 */
import { api } from './api.js';

export const SESSION_KEY = 'nevapro_session';

export function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        const session = JSON.parse(raw);
        // Inject into window for easier debugging/access if needed, but prefer getSession()
        window.USER_SESSION = session;
        return session;
    } catch {
        return null;
    }
}

export function setSession(session) {
    if (!session) {
        localStorage.removeItem(SESSION_KEY);
        window.USER_SESSION = null;
    } else {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        window.USER_SESSION = session;
    }
}

export async function fetchUserProfile() {
    try {
        const userData = await api.get('users/me');
        const session = getSession();
        if (session) {
            session.user = userData;
            setSession(session);
        }
        return userData;
    } catch (error) {
        // Error handling is partly managed by api.js (like 401 logout)
        console.error('Failed to fetch user profile:', error);
        return null;
    }
}

export function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    window.USER_SESSION = null;
    window.location.href = 'login.html';
}

export async function validateAdminAccess() {
    const session = getSession();
    if (!session?.access_token || !session?.user?.is_admin) {
        return false;
    }

    try {
        const profile = await api.get('users/me');
        return Boolean(profile?.is_admin);
    } catch {
        return false;
    }
}

export function requireAuth() {
    const session = getSession();
    if (!session?.access_token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

export async function requireAdmin() {
    const isAdmin = await validateAdminAccess();
    if (!isAdmin) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

