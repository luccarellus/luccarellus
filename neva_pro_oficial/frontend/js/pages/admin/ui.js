/**
 * N.E.V.A Pro - Admin UI Helpers
 */

export const fmtDateTime = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).format(new Date(value));
};

export const fmtDate = (value) => {
    if (!value) return 'Sem data';
    // Ensure YYYY-MM-DD format works correctly with local time
    const dateStr = value.includes('T') ? value : `${value}T00:00:00`;
    return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: 'short' 
    }).format(new Date(dateStr));
};

export function setTab(tab) {
    const tabButtons = Array.from(document.querySelectorAll('.admin-nav button[data-tab]'));
    const panels = Array.from(document.querySelectorAll('.tab-panel[data-panel]'));
    
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === tab));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function updateKpis(state) {
    const elements = {
        'kpi-simulations': state.simulations.length,
        'kpi-materials': state.materials.length,
        'kpi-notices': state.notices.length,
        'badge-simulations': state.simulations.length,
        'badge-materials': state.materials.length,
        'badge-notices': state.notices.length
    };

    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    const nextSimulation = [...state.simulations]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .find((item) => new Date(`${item.date}T00:00:00`) >= new Date(new Date().toDateString()));

    const elNext = document.getElementById('kpi-next');
    const elNextLab = document.getElementById('kpi-next-label');

    if (elNext) elNext.textContent = nextSimulation ? fmtDate(nextSimulation.date) : '--';
    if (elNextLab) elNextLab.textContent = nextSimulation ? nextSimulation.title : 'Sem agendamento';
}

export function statusFromDate(dateValue) {
    const d = new Date(`${dateValue}T00:00:00`);
    const diff = Math.ceil((d - new Date(new Date().toDateString())) / 86400000);
    if (diff < 0) return 'chip-danger';
    if (diff <= 7) return 'chip-warn';
    return 'chip-ok';
}
