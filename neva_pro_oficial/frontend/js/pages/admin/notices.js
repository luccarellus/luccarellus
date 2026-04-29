/**
 * N.E.V.A Pro - Admin Notices Module
 */
import { state, saveState, getNowIso } from './state.js';
import { setTab } from './ui.js';
import { showToast } from '../../core/utils.js';

export function initNotices() {
    const list = document.getElementById('notice-list');
    const saveBtn = document.getElementById('save-notice');
    const clearBtn = document.getElementById('clear-notice');

    if (saveBtn) saveBtn.addEventListener('click', handleSave);
    if (clearBtn) clearBtn.addEventListener('click', () => resetForm());
    if (list) list.addEventListener('click', handleListClick);

    renderNotices();
}

export function renderNotices() {
    const list = document.getElementById('notice-list');
    if (!list) return;

    list.innerHTML = state.notices.map((item, index) => `
        <article class="module-item glass hover-lift">
            <div class="item-info">
                <strong>${item.title}</strong>
                <p class="text-sm text-muted">${item.body}</p>
                <div class="item-meta">
                    <span class="mini-chip chip-muted">${item.tag}</span>
                    <span class="text-xs">${getCategoryLabel(item.category)}</span>
                </div>
            </div>
            <div class="stack-actions">
                <button class="btn btn-secondary btn-sm" data-edit-notice="${index}">
                    <i data-lucide="edit-2"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" data-delete-notice="${index}">
                    <i data-lucide="trash-2"></i> Excluir
                </button>
            </div>
        </article>
    `).join('') || '<div class="info-card">Nenhum recado criado ainda.</div>';

    if (window.lucide) window.lucide.createIcons();
}

function handleSave() {
    const title = document.getElementById('notice-title').value.trim();
    const category = document.getElementById('notice-category').value;
    const tag = document.getElementById('notice-tag').value.trim() || 'Aviso';
    const body = document.getElementById('notice-copy').value.trim();

    if (!title || !body) {
        showToast('Preencha título e texto do recado.', 'warning');
        return;
    }

    const payload = { 
        title, 
        category, 
        tag, 
        body, 
        updatedAt: getNowIso() 
    };

    if (state.currentEditing.notices !== null) {
        const idx = state.currentEditing.notices;
        state.notices[idx] = { ...state.notices[idx], ...payload };
        showToast('Recado atualizado com sucesso!', 'success');
    } else {
        payload.createdAt = getNowIso();
        state.notices.unshift(payload);
        showToast('Novo recado publicado!', 'success');
    }

    state.currentEditing.notices = null;
    resetForm();
    saveState();
}

function handleListClick(e) {
    const editBtn = e.target.closest('[data-edit-notice]');
    const deleteBtn = e.target.closest('[data-delete-notice]');

    if (editBtn) {
        const idx = Number(editBtn.dataset.editNotice);
        loadIntoForm(idx);
    }

    if (deleteBtn) {
        const idx = Number(deleteBtn.dataset.deleteNotice);
        if (confirm('Tem certeza que deseja excluir este recado?')) {
            state.notices.splice(idx, 1);
            saveState();
            showToast('Recado removido.', 'info');
        }
    }
}

function loadIntoForm(idx) {
    const item = state.notices[idx];
    if (!item) return;

    document.getElementById('notice-title').value = item.title;
    document.getElementById('notice-category').value = item.category;
    document.getElementById('notice-tag').value = item.tag;
    document.getElementById('notice-copy').value = item.body;

    state.currentEditing.notices = idx;
    const saveBtn = document.getElementById('save-notice');
    if (saveBtn) saveBtn.textContent = 'Atualizar recado';

    setTab('mural');
    showToast('Recado carregado para edição.', 'info');
}

function resetForm() {
    document.getElementById('notice-form')?.reset();
    state.currentEditing.notices = null;
    const saveBtn = document.getElementById('save-notice');
    if (saveBtn) saveBtn.textContent = 'Salvar recado';
}

function getCategoryLabel(category) {
    const labels = {
        'official': 'Aviso oficial',
        'agenda': 'Agenda',
        'study': 'Estudos',
        'support': 'Apoio'
    };
    return labels[category] || 'Geral';
}
