/**
 * N.E.V.A Pro - Settings Modal Component
 */
import { loadSettings, saveSettings, getDefaultSettings } from '../core/settings.js';
import { applySettingsToUI } from './layout.js';
import { showToast } from '../core/utils.js';

export function injectSettingsModal() {
    if (document.getElementById('settings-modal')) return;

    const modalHtml = `
        <div class="modal-overlay" id="settings-modal">
            <div class="modal-content">
                <div class="modal-sidebar">
                    <h2 class="font-bold text-xl" style="margin-bottom: 2rem;">Configurações</h2>
                    <nav style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="modal-nav-item active" data-tab="profile"><i data-lucide="user" style="width: 18px;"></i> Perfil</button>
                        <button class="modal-nav-item" data-tab="notifications"><i data-lucide="bell" style="width: 18px;"></i> Notificações</button>
                        <button class="modal-nav-item" data-tab="appearance"><i data-lucide="palette" style="width: 18px;"></i> Aparência</button>
                        <button class="modal-nav-item" data-tab="privacy"><i data-lucide="shield" style="width: 18px;"></i> Privacidade</button>
                    </nav>
                </div>
                <div class="modal-body">
                    <div class="modal-header">
                        <h3 class="font-bold text-lg" id="settings-title">Seu Perfil</h3>
                        <button class="modal-close" id="btn-close-modal"><i data-lucide="x"></i></button>
                    </div>

                    <div id="settings-panel-profile" data-settings-panel="profile">
                        <div class="settings-grid two-col">
                            <div class="settings-field">
                                <label for="settings-display-name">Nome de Exibição</label>
                                <input id="settings-display-name" type="text" placeholder="Seu nome" />
                                <div class="settings-hint">Esse nome aparece no topo e no ranking.</div>
                            </div>
                            <div class="settings-field">
                                <label for="settings-email">Email</label>
                                <input id="settings-email" type="email" readonly />
                            </div>
                        </div>

                        <div class="settings-grid two-col" style="margin-top: 1rem;">
                            <div class="settings-field">
                                <label for="settings-daily-goal">Meta de Horas Diárias</label>
                                <select id="settings-daily-goal">
                                    <option value="2">2 Horas</option>
                                    <option value="4">4 Horas</option>
                                    <option value="6">6 Horas</option>
                                    <option value="8">8 Horas</option>
                                </select>
                            </div>
                            <div class="settings-field">
                                <label for="settings-language">Idioma (Linguagens)</label>
                                <select id="settings-language">
                                    <option value="espanhol">Espanhol</option>
                                    <option value="ingles">Inglês</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div id="settings-panel-notifications" data-settings-panel="notifications" style="display: none;">
                        <div class="toggle-row">
                            <div class="toggle-text">
                                <div class="toggle-title">Emails de Progresso</div>
                                <div class="toggle-desc">Receber resumo semanal e lembretes de meta.</div>
                            </div>
                            <label class="toggle">
                                <input id="settings-notif-email" type="checkbox" />
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="toggle-row" style="margin-top: 12px;">
                            <div class="toggle-text">
                                <div class="toggle-title">Notificações no Navegador</div>
                                <div class="toggle-desc">Alertas quando bater meta ou concluir simulado.</div>
                            </div>
                            <label class="toggle">
                                <input id="settings-notif-push" type="checkbox" />
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div id="settings-panel-appearance" data-settings-panel="appearance" style="display: none;">
                        <div class="settings-field">
                            <label for="settings-theme">Tema</label>
                            <select id="settings-theme">
                                <option value="system">Sistema</option>
                                <option value="light">Claro</option>
                                <option value="dark">Escuro</option>
                            </select>
                        </div>

                        <div class="toggle-row" style="margin-top: 12px;">
                            <div class="toggle-text">
                                <div class="toggle-title">Reduzir Animações</div>
                                <div class="toggle-desc">Diminui animações e transições para maior estabilidade.</div>
                            </div>
                            <label class="toggle">
                                <input id="settings-reduce-motion" type="checkbox" />
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div id="settings-panel-privacy" data-settings-panel="privacy" style="display: none;">
                        <div class="settings-field">
                            <label for="settings-visibility">Visibilidade do Perfil</label>
                            <select id="settings-visibility">
                                <option value="public">Público</option>
                                <option value="private">Privado</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button class="btn btn-primary" id="settings-save">Salvar Alterações</button>
                        <button class="btn btn-outline" id="settings-reset">Restaurar Padrões</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setupSettingsEvents();
}

async function setupSettingsEvents() {
    const modal = document.getElementById('settings-modal');
    const btnSettings = document.getElementById('btn-settings');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const tabButtons = modal.querySelectorAll('.modal-nav-item[data-tab]');
    const panels = modal.querySelectorAll('[data-settings-panel]');
    const saveBtn = document.getElementById('settings-save');
    const resetBtn = document.getElementById('settings-reset');

    if (btnSettings) {
        btnSettings.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            refreshForm();
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => modal.classList.remove('active'));
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.toggle('active', b === btn));
            panels.forEach(p => p.style.display = p.getAttribute('data-settings-panel') === tab ? 'block' : 'none');
            const titleMap = { profile: 'Seu Perfil', notifications: 'Notificações', appearance: 'Aparência', privacy: 'Privacidade' };
            document.getElementById('settings-title').textContent = titleMap[tab];
            if (window.lucide) window.lucide.createIcons();
        });
    });

    saveBtn.addEventListener('click', async () => {
        const next = readForm();
        await saveSettings(next);
        applySettingsToUI(next);
        showToast('Configurações salvas com sucesso!', 'success');
    });

    resetBtn.addEventListener('click', async () => {
        const defaults = getDefaultSettings();
        await saveSettings(defaults);
        populateForm(defaults);
        applySettingsToUI(defaults);
        showToast('Padrões restaurados.', 'info');
    });

    async function refreshForm() {
        const current = await loadSettings();
        populateForm(current);
    }
}

function populateForm(from) {
    document.getElementById('settings-display-name').value = from.displayName || '';
    document.getElementById('settings-email').value = from.email || '';
    document.getElementById('settings-daily-goal').value = String(from.dailyGoalHours || '4');
    document.getElementById('settings-language').value = from.preferredLanguage || 'espanhol';
    document.getElementById('settings-notif-email').checked = Boolean(from.notificationsEmail);
    document.getElementById('settings-notif-push').checked = Boolean(from.notificationsPush);
    document.getElementById('settings-theme').value = from.theme || 'system';
    document.getElementById('settings-reduce-motion').checked = Boolean(from.reduceMotion);
    document.getElementById('settings-visibility').value = from.profileVisibility || 'public';
}

function readForm() {
    return {
        ...getDefaultSettings(),
        displayName: document.getElementById('settings-display-name').value.trim() || 'Estudante',
        email: document.getElementById('settings-email').value.trim(),
        dailyGoalHours: document.getElementById('settings-daily-goal').value,
        preferredLanguage: document.getElementById('settings-language').value,
        notificationsEmail: document.getElementById('settings-notif-email').checked,
        notificationsPush: document.getElementById('settings-notif-push').checked,
        theme: document.getElementById('settings-theme').value,
        reduceMotion: document.getElementById('settings-reduce-motion').checked,
        profileVisibility: document.getElementById('settings-visibility').value,
    };
}
