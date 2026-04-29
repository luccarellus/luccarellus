/**
 * N.E.V.A Pro - Admin Materials Module
 */
import { state, saveState, getNowIso } from './state.js';
import { setTab } from './ui.js';
import { showToast } from '../../core/utils.js';

export function initMaterials() {
    const list = document.getElementById('material-list');
    const saveBtn = document.getElementById('save-material');
    const clearBtn = document.getElementById('clear-material');

    if (saveBtn) saveBtn.addEventListener('click', handleSave);
    if (clearBtn) clearBtn.addEventListener('click', () => resetForm());
    if (list) list.addEventListener('click', handleListClick);

    renderMaterials();
}

export function renderMaterials() {
    const list = document.getElementById('material-list');
    if (!list) return;

    list.innerHTML = state.materials.map((item, index) => `
        <article class="module-item glass hover-lift">
            <div class="item-info">
                <strong>${item.title}</strong>
                <p class="text-xs text-muted">${item.type.toUpperCase()} • ${item.grade}</p>
                <p class="text-sm">${item.description}</p>
            </div>
            <div class="stack-actions">
                <button class="btn btn-secondary btn-sm" data-edit-material="${index}">
                    <i data-lucide="edit-2"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" data-delete-material="${index}">
                    <i data-lucide="trash-2"></i> Excluir
                </button>
            </div>
        </article>
    `).join('') || '<div class="info-card">Nenhum material criado ainda.</div>';

    if (window.lucide) window.lucide.createIcons();
}

function handleSave() {
    const title = document.getElementById('material-title').value.trim();
    const type = document.getElementById('material-type').value;
    const grade = document.getElementById('material-grade').value;
    const link = document.getElementById('material-link').value.trim();
    const description = document.getElementById('material-description').value.trim();

    if (!title || !description) {
        showToast('Preencha título e descrição do material.', 'warning');
        return;
    }

    const payload = { 
        title, 
        type, 
        grade, 
        link, 
        description, 
        updatedAt: getNowIso() 
    };

    if (state.currentEditing.materials !== null) {
        const idx = state.currentEditing.materials;
        state.materials[idx] = { ...state.materials[idx], ...payload };
        showToast('Material atualizado com sucesso!', 'success');
    } else {
        payload.createdAt = getNowIso();
        state.materials.unshift(payload);
        showToast('Material cadastrado!', 'success');
    }

    state.currentEditing.materials = null;
    resetForm();
    saveState();
}

function handleListClick(e) {
    const editBtn = e.target.closest('[data-edit-material]');
    const deleteBtn = e.target.closest('[data-delete-material]');

    if (editBtn) {
        const idx = Number(editBtn.dataset.editMaterial);
        loadIntoForm(idx);
    }

    if (deleteBtn) {
        const idx = Number(deleteBtn.dataset.deleteMaterial);
        if (confirm('Tem certeza que deseja excluir este material?')) {
            state.materials.splice(idx, 1);
            saveState();
            showToast('Material removido.', 'info');
        }
    }
}

function loadIntoForm(idx) {
    const item = state.materials[idx];
    if (!item) return;

    document.getElementById('material-title').value = item.title;
    document.getElementById('material-type').value = item.type;
    document.getElementById('material-grade').value = item.grade;
    document.getElementById('material-link').value = item.link || '';
    document.getElementById('material-description').value = item.description;

    state.currentEditing.materials = idx;
    const saveBtn = document.getElementById('save-material');
    if (saveBtn) saveBtn.textContent = 'Atualizar material';

    setTab('materials');
    showToast('Material carregado para edição.', 'info');
}

function resetForm() {
    document.getElementById('material-form')?.reset();
    state.currentEditing.materials = null;
    const saveBtn = document.getElementById('save-material');
    if (saveBtn) saveBtn.textContent = 'Salvar material';
}
