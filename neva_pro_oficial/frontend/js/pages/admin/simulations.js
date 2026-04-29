/**
 * N.E.V.A Pro - Admin Simulations Module
 */
import { state, saveState, getNowIso } from './state.js';
import { setTab, fmtDate, statusFromDate } from './ui.js';
import { showToast } from '../../core/utils.js';

export function initSimulations() {
    const list = document.getElementById('simulation-list');
    const saveBtn = document.getElementById('save-simulation');
    const clearBtn = document.getElementById('clear-simulation');

    if (saveBtn) saveBtn.addEventListener('click', handleSave);
    if (clearBtn) clearBtn.addEventListener('click', () => resetForm());
    if (list) list.addEventListener('click', handleListClick);

    renderSimulations();
}

export function renderSimulations() {
    const list = document.getElementById('simulation-list');
    if (!list) return;

    list.innerHTML = state.simulations.map((item, index) => `
        <article class="module-item glass hover-lift">
            <div class="item-info">
                <strong>${item.title}</strong>
                <p class="text-xs text-muted">${item.questions} questões • ${fmtDate(item.date)}</p>
                <p class="text-sm">${item.note}</p>
                <div class="item-meta">
                    <span class="mini-chip ${statusFromDate(item.date)}">${getAudienceLabel(item.audience)}</span>
                </div>
            </div>
            <div class="stack-actions">
                <button class="btn btn-secondary btn-sm" data-edit-simulation="${index}">
                    <i data-lucide="edit-2"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" data-delete-simulation="${index}">
                    <i data-lucide="trash-2"></i> Excluir
                </button>
            </div>
        </article>
    `).join('') || '<div class="info-card">Nenhum simulado criado ainda.</div>';

    if (window.lucide) window.lucide.createIcons();
}

function handleSave() {
    const title = document.getElementById('simulation-title').value.trim();
    const date = document.getElementById('simulation-date').value;
    const questions = Number(document.getElementById('simulation-questions').value || 20);
    const audience = document.getElementById('simulation-audience').value;
    const note = document.getElementById('simulation-note').value.trim();

    if (!title || !date) {
        showToast('Preencha título e data do simulado.', 'warning');
        return;
    }

    const payload = { 
        title, 
        date, 
        questions, 
        audience, 
        note, 
        updatedAt: getNowIso() 
    };

    if (state.currentEditing.simulations !== null) {
        const idx = state.currentEditing.simulations;
        state.simulations[idx] = { ...state.simulations[idx], ...payload };
        showToast('Simulado atualizado!', 'success');
    } else {
        payload.createdAt = getNowIso();
        state.simulations.unshift(payload);
        showToast('Simulado agendado com sucesso!', 'success');
    }

    state.currentEditing.simulations = null;
    resetForm();
    saveState();
}

function handleListClick(e) {
    const editBtn = e.target.closest('[data-edit-simulation]');
    const deleteBtn = e.target.closest('[data-delete-simulation]');

    if (editBtn) {
        const idx = Number(editBtn.dataset.editSimulation);
        loadIntoForm(idx);
    }

    if (deleteBtn) {
        const idx = Number(deleteBtn.dataset.deleteSimulation);
        if (confirm('Deseja cancelar este simulado?')) {
            state.simulations.splice(idx, 1);
            saveState();
            showToast('Simulado removido.', 'info');
        }
    }
}

function loadIntoForm(idx) {
    const item = state.simulations[idx];
    if (!item) return;

    document.getElementById('simulation-title').value = item.title;
    document.getElementById('simulation-date').value = item.date;
    document.getElementById('simulation-questions').value = item.questions;
    document.getElementById('simulation-audience').value = item.audience;
    document.getElementById('simulation-note').value = item.note;

    state.currentEditing.simulations = idx;
    const saveBtn = document.getElementById('save-simulation');
    if (saveBtn) saveBtn.textContent = 'Atualizar simulado';

    setTab('simulations');
    showToast('Simulado carregado para edição.', 'info');
}

function resetForm() {
    document.getElementById('simulation-form')?.reset();
    const qInput = document.getElementById('simulation-questions');
    if (qInput) qInput.value = '20';
    state.currentEditing.simulations = null;
    const saveBtn = document.getElementById('save-simulation');
    if (saveBtn) saveBtn.textContent = 'Salvar simulado';
}

function getAudienceLabel(audience) {
    const labels = {
        'all': 'Público Geral',
        'premium': 'Alunos Premium',
        'beta': 'Grupo Beta'
    };
    return labels[audience] || audience;
}
