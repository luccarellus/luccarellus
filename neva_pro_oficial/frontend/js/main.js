/**
 * N.E.V.A Pro - Main Application Entry Point
 */
import { getSession, fetchUserProfile, requireAuth } from './core/auth.js';
import { loadSettings } from './core/settings.js';
import { initLayout, applySettingsToUI } from './components/layout.js';
import { injectSettingsModal } from './components/settings-modal.js';
import { initLogin } from './pages/login.js';
import { initDashboard } from './pages/dashboard.js';
import { initQuestoes } from './pages/questoes.js';
import { initRanking } from './pages/ranking.js';
import { initSimulado } from './pages/simulado.js';
import { initMural } from './pages/mural.js';
import { initCalendario } from './pages/calendario.js';
import { initAdmin } from './pages/admin.js';

document.addEventListener('DOMContentLoaded', async () => {
    const page = getCurrentPage();
    const isLoginPage = page === 'login';
    const isAdminPage = page === 'admin';
    const session = getSession();

    // 1. Initialize Page Specific Logic First
    if (isLoginPage) {
        initLogin();
    } else {
        // Require auth for all other pages
        const authorized = requireAuth();
        if (!authorized) return;

        // Initialize Layout & Settings (Skip for Admin)
        if (!isAdminPage) {
            await initLayout();
            injectSettingsModal();
            const settings = await loadSettings();
            applySettingsToUI(settings);
        }

        // Initialize Specific Pages
        if (page === 'index') {
            initDashboard();
        } else if (page === 'questoes') {
            initQuestoes();
        } else if (page === 'ranking') {
            initRanking();
        } else if (page === 'simulado') {
            initSimulado();
        } else if (page === 'mural') {
            initMural();
        } else if (page === 'calendario') {
            initCalendario();
        } else if (isAdminPage) {
            initAdmin();
        }

        // Background Profile Sync
        if (session) {
            fetchUserProfile()
                .then(async () => {
                    const updatedSettings = await loadSettings();
                    applySettingsToUI(updatedSettings);
                    if (window.lucide) window.lucide.createIcons();
                })
                .catch(() => {});
        }
    }

    // 6. Initialize Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

function getCurrentPage() {
    const pathname = window.location.pathname;
    const segment = pathname.split('/').filter(Boolean).pop() || 'index';
    return segment.replace(/\.html$/i, '') || 'index';
}
