/**
 * N.E.V.A Pro - Admin Overview Module
 */
import { fmtDateTime, fmtDate } from './ui.js';

export function renderOverview(state) {
    renderVolumeChart(state);
    renderDistribution(state);
    renderActivityList(state);
    renderNextSimulations(state);
}

function renderVolumeChart(state) {
    const volume = document.getElementById('volume-chart');
    if (!volume) return;

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const series = days.map((day) => {
        const key = day.toDateString();
        const total = [...state.notices, ...state.materials, ...state.simulations]
            .filter((item) => {
                const created = item.createdAt ? new Date(item.createdAt) : null;
                return created && created.toDateString() === key;
            }).length;
        return { 
            label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day).replace('.', ''), 
            value: total 
        };
    });

    const max = Math.max(1, ...series.map((i) => i.value));
    
    volume.innerHTML = series.map((item) => `
        <div class="chart-col">
            <div class="chart-value">${item.value}</div>
            <div class="chart-bar" style="height:${Math.max(8, (item.value / max) * 100)}%;"></div>
            <div class="chart-label">${item.label}</div>
        </div>
    `).join('');
}

function renderDistribution(state) {
    const dist = document.getElementById('distribution-list');
    if (!dist) return;

    const distribution = [
        { label: 'Simulados', value: state.simulations.length },
        { label: 'Materiais', value: state.materials.length },
        { label: 'Recados', value: state.notices.length },
    ];
    
    const total = Math.max(1, distribution.reduce((acc, item) => acc + item.value, 0));
    
    dist.innerHTML = distribution.map((item) => `
        <div class="status-row">
            <div style="flex: 1;">
                <strong>${item.label}</strong>
                <small>${item.value} itens no momento</small>
            </div>
            <div class="status-value">${Math.round((item.value / total) * 100)}%</div>
        </div>
    `).join('');
}

function renderActivityList(state) {
    const activity = document.getElementById('activity-list');
    if (!activity) return;

    const recent = [
        ...state.simulations.map((item) => ({ ...item, kind: 'Simulado', time: item.updatedAt, desc: `${item.questions} questões • ${fmtDate(item.date)}` })),
        ...state.materials.map((item) => ({ ...item, kind: 'Material', time: item.updatedAt, desc: `${item.type.toUpperCase()} • ${item.grade}` })),
        ...state.notices.map((item) => ({ ...item, kind: 'Recado', time: item.updatedAt, desc: item.tag }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    activity.innerHTML = recent.length ? recent.map((item) => `
        <div class="activity-item">
            <div class="activity-bullet"></div>
            <div class="activity-content">
                <strong>${item.kind}: ${item.title}</strong>
                <small>${fmtDateTime(item.time)}</small>
                <p>${item.desc}</p>
            </div>
        </div>
    `).join('') : '<div class="info-card"><p>Nada recente por enquanto.</p></div>';
}

function renderNextSimulations(state) {
    const nextContent = document.getElementById('next-content-list');
    if (!nextContent) return;

    const nextItems = [...state.simulations]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .filter(item => new Date(`${item.date}T00:00:00`) >= new Date(new Date().toDateString()))
        .slice(0, 3);

    nextContent.innerHTML = nextItems.length ? nextItems.map((item) => `
        <div class="status-row">
            <div>
                <strong>${item.title}</strong>
                <small>${fmtDate(item.date)} • ${item.audience === 'all' ? 'Todos' : item.audience === 'premium' ? 'Turma' : 'Beta'}</small>
            </div>
            <div class="status-value">${item.questions}q</div>
        </div>
    `).join('') : '<div class="info-card"><p>Nenhum simulado agendado.</p></div>';
}
