/**
 * N.E.V.A Pro - Admin Dashboard (Refactored)
 */
import { requireAdmin } from '../core/auth.js';
import { state, loadState, saveState } from './admin/state.js';
import { setTab, updateKpis } from './admin/ui.js';
import { renderOverview } from './admin/overview.js';
import { initNotices, renderNotices } from './admin/notices.js';
import { initMaterials, renderMaterials } from './admin/materials.js';
import { initSimulations, renderSimulations } from './admin/simulations.js';

export async function initAdmin() {
    // 1. Protection Guard
    const authorized = await requireAdmin();
    if (!authorized) return;

    // 2. Initialize State
    loadState();

    // 3. Setup Navigation
    const tabButtons = document.querySelectorAll('.admin-nav button[data-tab]');
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => setTab(btn.dataset.tab));
    });

    // 4. Initialize Sub-modules
    initNotices();
    initMaterials();
    initSimulations();

    // 5. Global Event Listeners
    setupGlobalEvents();

    // 6. Initial Render
    refreshAll();

    // 7. Auto-refresh and Clock
    initAutoRefresh();
}

function refreshAll() {
    updateKpis(state);
    renderOverview(state);
    renderNotices();
    renderMaterials();
    renderSimulations();
}

function setupGlobalEvents() {
    // Listen for state changes to refresh UI
    window.addEventListener('admin-state-changed', () => {
        refreshAll();
    });

    // Primary actions (placeholders for future real data workflows)
    document.getElementById('action-new-notice')?.addEventListener('click', () => {
        setTab('mural');
        document.getElementById('notice-title')?.focus();
    });

    document.getElementById('action-new-material')?.addEventListener('click', () => {
        setTab('materials');
        document.getElementById('material-title')?.focus();
    });

    document.getElementById('action-new-event')?.addEventListener('click', () => {
        setTab('simulations');
        document.getElementById('simulation-title')?.focus();
    });
}

function initAutoRefresh() {
    const updateClock = () => {
        const el = document.getElementById('live-clock');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleTimeString('pt-BR', { hour12: false });
        }
    };

    updateClock();
    setInterval(updateClock, 1000);
    
    // Background refresh every 30 seconds
    setInterval(() => {
        updateKpis(state);
        renderOverview(state);
    }, 30000);
}
