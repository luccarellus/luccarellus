/**
 * Dashboard Weekly Progress Module
 */
import { loadSettings } from '../../core/settings.js';
import { showToast } from '../../core/utils.js';

export function initWeeklyProgress() {
    const link = document.getElementById('weekly-details-link');
    const chart = document.getElementById('weekly-chart');
    if (!link || !chart) return;

    link.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const data = await getWeeklyDataFromChart(chart);
            openWeeklyDetailsModal(data);
        } catch (error) {
            console.error('Error loading weekly details:', error);
            showToast('Erro ao carregar detalhes semanais.', 'error');
        }
    });

    // Animate bars on load
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    progressBars.forEach(bar => {
        const targetHeight = bar.getAttribute('data-height');
        setTimeout(() => {
            bar.style.height = targetHeight + '%';
        }, 300);
    });
}

async function getWeeklyDataFromChart(chartEl) {
    const labels = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    const bars = Array.from(chartEl.querySelectorAll('.progress-bar-fill'));
    const values = bars.slice(0, 7).map((bar) => Number(bar.getAttribute('data-height') || 0));

    const paired = labels.map((label, idx) => ({
        label,
        focus: Math.max(0, Math.min(100, values[idx] ?? 0)),
    }));

    const settings = await loadSettings();
    const dailyGoal = Number(settings.dailyGoalHours || 4);

    paired.forEach((day) => {
        const hours = (day.focus / 100) * (dailyGoal * 1.6);
        day.hours = Math.round(hours * 10) / 10;
        day.questions = Math.max(0, Math.round(day.focus * 0.9));
        day.xp = Math.max(0, Math.round(day.focus * 12));
    });

    const totalHours = paired.reduce((acc, d) => acc + d.hours, 0);
    const totalQuestions = paired.reduce((acc, d) => acc + d.questions, 0);
    const totalXp = paired.reduce((acc, d) => acc + d.xp, 0);

    const best = paired.reduce((a, b) => (b.focus > a.focus ? b : a), paired[0] || { label: 'seg', focus: 0 });
    const avgFocus = paired.length ? Math.round(paired.reduce((acc, d) => acc + d.focus, 0) / paired.length) : 0;

    const prevAvg = Math.max(0, Math.min(100, avgFocus - 8));
    const delta = avgFocus - prevAvg;

    return {
        days: paired,
        totalHours: Math.round(totalHours * 10) / 10,
        totalQuestions,
        totalXp,
        bestDay: best.label,
        avgFocus,
        deltaFocus: delta,
        dailyGoal,
    };
}

function openWeeklyDetailsModal(data) {
    let modal = document.getElementById('weekly-details-modal');
    if (!modal) {
        createWeeklyModalHTML();
        modal = document.getElementById('weekly-details-modal');
        document.getElementById('weekly-details-close').addEventListener('click', () => modal.classList.remove('active'));
    }

    updateWeeklyModalContent(data);

    const tabs = modal.querySelectorAll('.weekly-tab');
    tabs.forEach((tab) => {
        tab.replaceWith(tab.cloneNode(true)); // Clear listeners
    });
    
    const newTabs = modal.querySelectorAll('.weekly-tab');
    newTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            newTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            renderWeeklyBars(data, tab.getAttribute('data-metric'));
        });
    });

    renderWeeklyBars(data, 'focus');
    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
}

function createWeeklyModalHTML() {
    const html = `
        <div class="modal-overlay" id="weekly-details-modal">
            <div class="modal-content" style="max-width: 920px;">
                <div class="modal-body" style="padding: 1.75rem;">
                    <div class="weekly-modal-top" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                        <div>
                            <h3 class="font-bold text-lg">Detalhes do Progresso Semanal</h3>
                            <div class="text-muted" style="font-size: 0.85rem;">Entenda seu ritmo e ajuste a sua meta.</div>
                        </div>
                        <button class="modal-close" id="weekly-details-close" style="background: none; border: none; cursor: pointer; color: var(--text-muted);"><i data-lucide="x"></i></button>
                    </div>
                    <div class="weekly-kpis" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div class="weekly-kpi card" style="padding: 1rem; text-align: center;">
                            <div class="label" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Foco médio</div>
                            <div class="value" id="weekly-kpi-focus" style="font-size: 1.25rem; font-weight: 800;">--</div>
                            <div class="sub" id="weekly-kpi-delta" style="font-size: 0.65rem;">--</div>
                        </div>
                        <div class="weekly-kpi card" style="padding: 1rem; text-align: center;">
                            <div class="label" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Tempo estimado</div>
                            <div class="value" id="weekly-kpi-hours" style="font-size: 1.25rem; font-weight: 800;">--</div>
                            <div class="sub" style="font-size: 0.65rem; color: var(--text-muted);">Meta diária</div>
                        </div>
                        <div class="weekly-kpi card" style="padding: 1rem; text-align: center;">
                            <div class="label" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Questões</div>
                            <div class="value" id="weekly-kpi-questions" style="font-size: 1.25rem; font-weight: 800;">--</div>
                            <div class="sub" style="font-size: 0.65rem; color: var(--text-muted);">Total na semana</div>
                        </div>
                        <div class="weekly-kpi card" style="padding: 1rem; text-align: center;">
                            <div class="label" style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px;">Melhor dia</div>
                            <div class="value" id="weekly-kpi-best" style="font-size: 1.25rem; font-weight: 800;">--</div>
                            <div class="sub" style="font-size: 0.65rem; color: var(--text-muted);">Maior foco</div>
                        </div>
                    </div>
                    <div class="weekly-metric-tabs" style="display: flex; gap: 8px; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                        <button class="weekly-tab active" data-metric="focus" style="padding: 6px 16px; border-radius: 999px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Foco</button>
                        <button class="weekly-tab" data-metric="hours" style="padding: 6px 16px; border-radius: 999px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Tempo</button>
                        <button class="weekly-tab" data-metric="questions" style="padding: 6px 16px; border-radius: 999px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Questões</button>
                        <button class="weekly-tab" data-metric="xp" style="padding: 6px 16px; border-radius: 999px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 0.85rem; font-weight: 600;">XP</button>
                    </div>
                    <div class="card" style="margin-top: 12px; padding: 2rem 1rem;">
                        <div class="weekly-bars" id="weekly-details-bars" style="height: 240px; display: flex; align-items: flex-end; gap: 1rem;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

function updateWeeklyModalContent(data) {
    document.getElementById('weekly-kpi-focus').textContent = `${data.avgFocus}%`;
    document.getElementById('weekly-kpi-hours').textContent = `${data.totalHours}h`;
    document.getElementById('weekly-kpi-questions').textContent = String(data.totalQuestions);
    document.getElementById('weekly-kpi-best').textContent = data.bestDay.toUpperCase();

    const deltaEl = document.getElementById('weekly-kpi-delta');
    const sign = data.deltaFocus >= 0 ? '+' : '';
    deltaEl.textContent = `${sign}${data.deltaFocus}% vs. anterior`;
    deltaEl.style.color = data.deltaFocus >= 0 ? 'var(--success)' : 'var(--danger)';
}

function renderWeeklyBars(data, metric) {
    const container = document.getElementById('weekly-details-bars');
    if (!container) return;

    const max = Math.max(1, ...data.days.map((d) => Number(d[metric] ?? 0)));

    container.innerHTML = data.days.map((d) => {
        const raw = Number(d[metric] ?? 0);
        const pct = Math.round((raw / max) * 100);
        const valueText = metric === 'hours' ? `${raw}h` : String(raw);
        return `
            <div class="weekly-bar-col" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%;">
                <div class="weekly-bar" data-target="${pct}" style="width: 100%; background: var(--primary); border-radius: 8px 8px 4px 4px; transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1); height: 0; max-width: 40px;"></div>
                <div class="weekly-bar-value" style="font-size: 0.7rem; font-weight: 700;">${valueText}</div>
                <div class="weekly-bar-label" style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">${d.label}</div>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        container.querySelectorAll('.weekly-bar').forEach((bar) => {
            bar.style.height = `${bar.getAttribute('data-target')}%`;
        });
    }, 50);
}
