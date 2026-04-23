document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Components (Sidebar/Navbar)
    initLayout();
    
    // 2. Initialize Icons
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // 3. Dashboard Data Simulation
    initDashboard();
});

const SETTINGS_STORAGE_KEY = 'enempro_settings_v1';

function getDefaultSettings() {
    return {
        displayName: 'User Name',
        email: 'user@email.com',
        dailyGoalHours: '4',
        preferredLanguage: 'espanhol',
        notificationsEmail: true,
        notificationsPush: true,
        theme: 'system', // system | light | dark
        reduceMotion: false,
        profileVisibility: 'public', // public | private
    };
}

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return getDefaultSettings();
        const parsed = JSON.parse(raw);
        return { ...getDefaultSettings(), ...parsed };
    } catch (e) {
        return getDefaultSettings();
    }
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function applySettingsToUI(settings) {
    const nameEl = document.getElementById('nav-username');
    if (nameEl) nameEl.textContent = settings.displayName || 'User Name';

    const root = document.documentElement;
    if (settings.theme === 'light' || settings.theme === 'dark') {
        root.setAttribute('data-theme', settings.theme);
    } else {
        root.removeAttribute('data-theme');
    }

    if (settings.reduceMotion) {
        document.body.classList.add('reduce-motion');
    } else {
        document.body.classList.remove('reduce-motion');
    }
}

function initLayout() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const navbarContainer = document.getElementById('navbar-container');
    const settings = loadSettings();

    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="logo-icon">E</div>
                    <h1 class="font-bold text-xl text-blue">ENEM<span style="color: var(--text-primary)">Pro</span></h1>
                </div>
                <nav class="sidebar-nav">
                    <a href="index.html" class="nav-item ${window.location.pathname.includes('index.html') || window.location.pathname === '/' ? 'active' : ''}" data-route="dashboard">
                        <i data-lucide="layout-dashboard" class="text-blue"></i> Dashboard
                    </a>
                    <a href="questoes.html" class="nav-item ${window.location.pathname.includes('questoes.html') ? 'active' : ''}">
                        <i data-lucide="book-open" style="color: #8b5cf6"></i> Questões
                    </a>
                    <a href="simulado.html" class="nav-item ${window.location.pathname.includes('simulado.html') ? 'active' : ''}">
                        <i data-lucide="file-text" style="color: #db2777"></i> Simulados
                    </a>
                    <a href="ranking.html" class="nav-item ${window.location.pathname.includes('ranking.html') ? 'active' : ''}">
                        <i data-lucide="trophy" style="color: #ea580c"></i> Ranking
                    </a>
                    <a href="materiais.html" class="nav-item ${window.location.pathname.includes('materiais.html') ? 'active' : ''}">
                        <i data-lucide="files" style="color: #10b981"></i> Materiais
                    </a>
                    <a href="mural.html" class="nav-item ${window.location.pathname.includes('mural.html') ? 'active' : ''}">
                        <i data-lucide="message-square" style="color: #3b82f6"></i> Mural
                    </a>
                    <a href="calendario.html" class="nav-item ${window.location.pathname.includes('calendario.html') ? 'active' : ''}">
                        <i data-lucide="calendar" style="color: #64748b"></i> Calendário
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <a href="#" class="nav-item" id="btn-settings"><i data-lucide="settings"></i> Configurações</a>
                    <a href="login.html" class="nav-item text-red" style="color: #ef4444"><i data-lucide="log-out"></i> Sair</a>
                </div>
            </div>
        `;
    }

    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <header class="navbar">
                <div class="search-bar" style="position: relative; flex: 0.6;">
                    <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); width: 16px;"></i>
                    <input type="text" placeholder="Pesquisar matérias, questões..." 
                        style="width: 100%; border-radius: 20px; border: none; background: #f1f5f9; padding: 10px 10px 10px 40px; font-size: 0.9rem;">
                </div>
                <div class="user-actions" style="display: flex; align-items: center; gap: 15px;">
                    <div class="notification-wrapper">
                        <button class="btn-icon" id="btn-notifications" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); position: relative;">
                            <i data-lucide="bell"></i>
                            <span style="position: absolute; top: 0; right: 0; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid white;"></span>
                        </button>
                        <!-- Notification Dropdown -->
                        <div class="notification-dropdown" id="notification-dropdown">
                            <div class="notification-header">
                                <span class="font-bold">Notificações</span>
                                <button style="background: none; border: none; color: var(--primary); font-size: 0.8rem; cursor: pointer; font-weight: 600;">Marcar como lidas</button>
                            </div>
                            <div class="notification-list">
                                <div class="notification-item unread">
                                    <div class="notification-icon" style="background: #eff6ff; color: #2563eb;"><i data-lucide="arrow-upCircle" style="width: 20px;"></i></div>
                                    <div class="notification-content">
                                        <p><strong>+500 XP!</strong> Você finalizou o simulado de Linguagens #4.</p>
                                        <span class="notification-time">1h atrás</span>
                                    </div>
                                </div>
                                <div class="notification-item unread">
                                    <div class="notification-icon" style="background: #fefce8; color: #eab308;"><i data-lucide="zap" style="width: 20px;"></i></div>
                                    <div class="notification-content">
                                        <p><strong>Meta Diária Atingida</strong>. Excelente progresso de estudos.</p>
                                        <span class="notification-time">3h atrás</span>
                                    </div>
                                </div>
                                <div class="notification-item">
                                    <div class="notification-icon" style="background: #f1f5f9; color: #64748b;"><i data-lucide="file-text" style="width: 20px;"></i></div>
                                    <div class="notification-content">
                                        <p>Novo material de Biologia Celular adicionado.</p>
                                        <span class="notification-time">Ontem</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="user-profile" style="display: flex; align-items: center; gap: 10px; border-left: 1px solid var(--border); padding-left: 15px;">
                        <div style="text-align: right; display: none; @media (min-width: 640px) { display: block; }">
                            <p class="font-bold text-sm" id="nav-username">User Name</p>
                            <p class="text-muted" style="font-size: 0.7rem;">Nível 15</p>
                        </div>
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(to top right, #2563eb, #38bdf8); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">
                            <i data-lucide="user" style="width: 20px;"></i>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    // Modal Injection
    if (!document.getElementById('settings-modal')) {
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
                                    <div class="settings-hint">No momento, o login real ainda não está integrado.</div>
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
                            <div class="settings-hint" style="margin-top: 10px;">Se o navegador bloquear, você pode habilitar depois nas permissões do site.</div>
                        </div>

                        <div id="settings-panel-appearance" data-settings-panel="appearance" style="display: none;">
                            <div class="settings-field">
                                <label for="settings-theme">Tema</label>
                                <select id="settings-theme">
                                    <option value="system">Sistema</option>
                                    <option value="light">Claro</option>
                                    <option value="dark">Escuro</option>
                                </select>
                                <div class="settings-hint">O tema "Sistema" segue a preferência do seu Windows.</div>
                            </div>

                            <div class="toggle-row" style="margin-top: 12px;">
                                <div class="toggle-text">
                                    <div class="toggle-title">Reduzir Animacoes</div>
                                    <div class="toggle-desc">Diminui animacoes e transicoes para ficar mais estavel.</div>
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
                                <div class="settings-hint">Quando privado, seu nome pode ser ocultado em futuras telas sociais.</div>
                            </div>
                        </div>

                        <div class="settings-actions">
                            <button class="btn btn-primary" id="settings-save">Salvar Alterações</button>
                            <button class="btn btn-outline" id="settings-reset">Restaurar Padrões</button>
                        </div>
                        <div class="settings-status" id="settings-status"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    applySettingsToUI(settings);
    setupInteractiveFeatures();
}

function setupInteractiveFeatures() {
    // Notification Toggle Logic
    const btnNotifications = document.getElementById('btn-notifications');
    const notificationDropdown = document.getElementById('notification-dropdown');

    if (btnNotifications && notificationDropdown) {
        btnNotifications.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!notificationDropdown.contains(e.target) && e.target !== btnNotifications) {
                notificationDropdown.classList.remove('active');
            }
        });
    }

    // Modal Toggle Logic
    const btnSettings = document.getElementById('btn-settings');
    const settingsModal = document.getElementById('settings-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');

    if (btnSettings && settingsModal) {
        btnSettings.addEventListener('click', (e) => {
            e.preventDefault();
            settingsModal.classList.add('active');
        });

        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', () => {
                settingsModal.classList.remove('active');
            });
        }

        // Close on overlay click
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }

    initSettingsModal();
}

function initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const titleEl = document.getElementById('settings-title');
    const statusEl = document.getElementById('settings-status');
    const tabButtons = Array.from(modal.querySelectorAll('.modal-nav-item[data-tab]'));
    const panels = Array.from(modal.querySelectorAll('[data-settings-panel]'));

    const current = loadSettings();

    function setStatus(text) {
        if (!statusEl) return;
        statusEl.textContent = text || '';
        if (text) setTimeout(() => { statusEl.textContent = ''; }, 1800);
    }

    function activateTab(tab) {
        const titleMap = {
            profile: 'Seu Perfil',
            notifications: 'Notificações',
            appearance: 'Aparência',
            privacy: 'Privacidade',
        };

        tabButtons.forEach((btn) => btn.classList.toggle('active', btn.getAttribute('data-tab') === tab));
        panels.forEach((panel) => {
            panel.style.display = panel.getAttribute('data-settings-panel') === tab ? 'block' : 'none';
        });

        if (titleEl) titleEl.textContent = titleMap[tab] || 'Configurações';
        if (window.lucide) window.lucide.createIcons();
    }

    function populateForm(from) {
        const displayName = document.getElementById('settings-display-name');
        const email = document.getElementById('settings-email');
        const dailyGoal = document.getElementById('settings-daily-goal');
        const language = document.getElementById('settings-language');
        const notifEmail = document.getElementById('settings-notif-email');
        const notifPush = document.getElementById('settings-notif-push');
        const theme = document.getElementById('settings-theme');
        const reduceMotion = document.getElementById('settings-reduce-motion');
        const visibility = document.getElementById('settings-visibility');

        if (displayName) displayName.value = from.displayName || '';
        if (email) email.value = from.email || '';
        if (dailyGoal) dailyGoal.value = String(from.dailyGoalHours || '4');
        if (language) language.value = from.preferredLanguage || 'espanhol';
        if (notifEmail) notifEmail.checked = Boolean(from.notificationsEmail);
        if (notifPush) notifPush.checked = Boolean(from.notificationsPush);
        if (theme) theme.value = from.theme || 'system';
        if (reduceMotion) reduceMotion.checked = Boolean(from.reduceMotion);
        if (visibility) visibility.value = from.profileVisibility || 'public';
    }

    function readForm() {
        const displayName = document.getElementById('settings-display-name');
        const email = document.getElementById('settings-email');
        const dailyGoal = document.getElementById('settings-daily-goal');
        const language = document.getElementById('settings-language');
        const notifEmail = document.getElementById('settings-notif-email');
        const notifPush = document.getElementById('settings-notif-push');
        const theme = document.getElementById('settings-theme');
        const reduceMotion = document.getElementById('settings-reduce-motion');
        const visibility = document.getElementById('settings-visibility');

        return {
            ...getDefaultSettings(),
            displayName: (displayName?.value || '').trim() || 'User Name',
            email: (email?.value || '').trim() || 'user@email.com',
            dailyGoalHours: String(dailyGoal?.value || '4'),
            preferredLanguage: String(language?.value || 'espanhol'),
            notificationsEmail: Boolean(notifEmail?.checked),
            notificationsPush: Boolean(notifPush?.checked),
            theme: String(theme?.value || 'system'),
            reduceMotion: Boolean(reduceMotion?.checked),
            profileVisibility: String(visibility?.value || 'public'),
        };
    }

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
    });

    const saveBtn = document.getElementById('settings-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const next = readForm();
            saveSettings(next);
            applySettingsToUI(next);
            setStatus('Configurações salvas.');
        });
    }

    const resetBtn = document.getElementById('settings-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const defaults = getDefaultSettings();
            saveSettings(defaults);
            populateForm(defaults);
            applySettingsToUI(defaults);
            setStatus('Padrões restaurados.');
        });
    }

    populateForm(current);
    applySettingsToUI(current);
    activateTab('profile');
}

function initDashboard() {
    // ENEM countdown (updates automatically by year; 2026 is explicitly defined)
    const countdownEl = document.getElementById('enem-countdown');
    if (countdownEl) {
        const now = new Date();
        const schedule = getNextEnemSchedule(now);
        const days = schedule.daysUntil;
        const dayLabel = schedule.whichDay === 1 ? 'Dia 1' : 'Dia 2';
        const dateLabel = formatDatePtBr(schedule.nextDate);

        if (days === 0) {
            countdownEl.textContent = `Hoje é o ENEM (${dayLabel})! Boa prova.`;
        } else if (days === 1) {
            countdownEl.textContent = `Você está a 1 dia do ENEM (${dayLabel} - ${dateLabel}). Mantenha o foco!`;
        } else {
            countdownEl.textContent = `Você está a ${days} dias do ENEM (${dayLabel} - ${dateLabel}). Mantenha o foco!`;
        }
    }

    initWeeklyProgressDetails();

    // Animating numbers or progress bars could go here
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    progressBars.forEach(bar => {
        const targetHeight = bar.getAttribute('data-height');
        setTimeout(() => {
            bar.style.height = targetHeight + '%';
        }, 100);
    });
}

function initWeeklyProgressDetails() {
    const link = document.getElementById('weekly-details-link');
    const chart = document.getElementById('weekly-chart');
    if (!link || !chart) return;

    link.addEventListener('click', (e) => {
        e.preventDefault();
        openWeeklyDetailsModal(getWeeklyDataFromChart(chart));
    });
}

function getWeeklyDataFromChart(chartEl) {
    const labels = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    const bars = Array.from(chartEl.querySelectorAll('.progress-bar-fill'));
    const values = bars.slice(0, 7).map((bar) => Number(bar.getAttribute('data-height') || 0));

    const paired = labels.map((label, idx) => ({
        label,
        focus: Math.max(0, Math.min(100, values[idx] ?? 0)),
    }));

    // Derive other metrics deterministically from focus (still mock-like but consistent)
    const settings = loadSettings();
    const dailyGoal = Number(settings.dailyGoalHours || 4);

    paired.forEach((day) => {
        // 0..100 focus -> 0..(dailyGoal*1.6) hours, rounded to 0.1
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

    // Simple comparison baseline (previous week) as -8% focus overall, clamped
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
        const html = `
            <div class="modal-overlay" id="weekly-details-modal">
                <div class="modal-content" style="max-width: 920px; height: auto; max-height: 86vh;">
                    <div class="modal-body" style="padding: 1.75rem;">
                        <div class="weekly-modal-top">
                            <div>
                                <div class="badge badge-blue" style="margin-bottom: 10px;"><i data-lucide="bar-chart-3" style="width: 14px;"></i> Semana</div>
                                <h3 class="font-bold text-lg" style="margin-bottom: 4px;">Detalhes do Progresso Semanal</h3>
                                <div class="text-muted" style="font-size: 0.85rem;">Entenda seu ritmo e ajuste a sua meta.</div>
                            </div>
                            <button class="modal-close" id="weekly-details-close" aria-label="Fechar"><i data-lucide="x"></i></button>
                        </div>

                        <div class="weekly-kpis" style="margin-top: 14px;">
                            <div class="weekly-kpi">
                                <div class="label">Foco médio</div>
                                <div class="value" id="weekly-kpi-focus">--</div>
                                <div class="sub" id="weekly-kpi-delta">--</div>
                            </div>
                            <div class="weekly-kpi">
                                <div class="label">Tempo estimado</div>
                                <div class="value" id="weekly-kpi-hours">--</div>
                                <div class="sub">Baseado na sua meta diária</div>
                            </div>
                            <div class="weekly-kpi">
                                <div class="label">Questões</div>
                                <div class="value" id="weekly-kpi-questions">--</div>
                                <div class="sub">Total na semana</div>
                            </div>
                            <div class="weekly-kpi">
                                <div class="label">Melhor dia</div>
                                <div class="value" id="weekly-kpi-best">--</div>
                                <div class="sub">Maior foco</div>
                            </div>
                        </div>

                        <div class="weekly-metric-tabs">
                            <button class="weekly-tab active" data-metric="focus">Foco</button>
                            <button class="weekly-tab" data-metric="hours">Tempo</button>
                            <button class="weekly-tab" data-metric="questions">Questões</button>
                            <button class="weekly-tab" data-metric="xp">XP</button>
                        </div>

                        <div class="card" style="margin-top: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <div class="font-bold">Distribuição por dia</div>
                                <div class="text-muted" id="weekly-metric-label" style="font-size: 0.85rem;">Foco (%)</div>
                            </div>
                            <div class="weekly-bars" id="weekly-details-bars"></div>
                        </div>

                        <div class="settings-status" id="weekly-details-footnote" style="margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('weekly-details-modal');

        const closeBtn = document.getElementById('weekly-details-close');
        if (closeBtn) closeBtn.addEventListener('click', () => closeWeeklyDetailsModal());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeWeeklyDetailsModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeWeeklyDetailsModal();
        });
    }

    // Populate KPIs
    const focusEl = document.getElementById('weekly-kpi-focus');
    const deltaEl = document.getElementById('weekly-kpi-delta');
    const hoursEl = document.getElementById('weekly-kpi-hours');
    const qEl = document.getElementById('weekly-kpi-questions');
    const bestEl = document.getElementById('weekly-kpi-best');
    const foot = document.getElementById('weekly-details-footnote');

    if (focusEl) focusEl.textContent = `${data.avgFocus}%`;
    if (hoursEl) hoursEl.textContent = `${data.totalHours}h`;
    if (qEl) qEl.textContent = String(data.totalQuestions);
    if (bestEl) bestEl.textContent = data.bestDay.toUpperCase();

    if (deltaEl) {
        const sign = data.deltaFocus >= 0 ? '+' : '';
        deltaEl.textContent = `${sign}${data.deltaFocus}% vs. semana anterior`;
        deltaEl.style.color = data.deltaFocus >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    if (foot) {
        foot.textContent = `Meta diária atual: ${data.dailyGoal}h. Dica: consistência > intensidade.`;
    }

    // Set up tabs and render bars
    const tabs = Array.from(modal.querySelectorAll('.weekly-tab'));
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            renderWeeklyBars(data, tab.getAttribute('data-metric') || 'focus');
        });
    });

    renderWeeklyBars(data, 'focus');

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
}

function closeWeeklyDetailsModal() {
    const modal = document.getElementById('weekly-details-modal');
    if (modal) modal.classList.remove('active');
}

function renderWeeklyBars(data, metric) {
    const container = document.getElementById('weekly-details-bars');
    const labelEl = document.getElementById('weekly-metric-label');
    if (!container) return;

    const metricLabelMap = {
        focus: 'Foco (%)',
        hours: 'Tempo (h)',
        questions: 'Questões',
        xp: 'XP',
    };
    if (labelEl) labelEl.textContent = metricLabelMap[metric] || 'Foco (%)';

    const max = Math.max(1, ...data.days.map((d) => Number(d[metric] ?? 0)));

    container.innerHTML = data.days.map((d) => {
        const raw = Number(d[metric] ?? 0);
        const pct = Math.round((raw / max) * 100);
        const strong = metric === 'focus' ? d.focus >= 70 : pct >= 70;
        const valueText = metric === 'hours' ? `${raw}h` : String(raw);
        return `
            <div class="weekly-bar-col">
                <div class="weekly-bar ${strong ? 'strong' : ''}" data-target="${pct}"></div>
                <div class="weekly-bar-value">${valueText}</div>
                <div class="weekly-bar-label">${d.label}</div>
            </div>
        `;
    }).join('');

    // Trigger animation
    setTimeout(() => {
        container.querySelectorAll('.weekly-bar').forEach((bar) => {
            const target = Number(bar.getAttribute('data-target') || 0);
            bar.style.height = `${target}%`;
        });
    }, 50);
}

function getNextEnemSchedule(now) {
    const fixed = {
        2026: { day1: '2026-11-01', day2: '2026-11-08' },
    };

    const year = now.getFullYear();

    const buildDatesForYear = (y) => {
        if (fixed[y]) {
            return {
                day1: parseIsoLocalDate(fixed[y].day1),
                day2: parseIsoLocalDate(fixed[y].day2),
            };
        }

        // Heuristic: first and second Sunday of November
        const day1 = firstSundayOfNovember(y);
        const day2 = new Date(day1);
        day2.setDate(day1.getDate() + 7);
        return { day1, day2 };
    };

    const startOfToday = localMidnight(now);

    const pickForYear = (y) => {
        const { day1, day2 } = buildDatesForYear(y);
        const d1 = localMidnight(day1);
        const d2 = localMidnight(day2);

        if (startOfToday <= d1) {
            return { nextDate: d1, whichDay: 1 };
        }
        if (startOfToday <= d2) {
            return { nextDate: d2, whichDay: 2 };
        }
        return null;
    };

    let chosen = pickForYear(year);
    let chosenYear = year;
    if (!chosen) {
        chosenYear = year + 1;
        chosen = pickForYear(chosenYear);
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.max(0, Math.round((chosen.nextDate.getTime() - startOfToday.getTime()) / msPerDay));

    return {
        year: chosenYear,
        nextDate: chosen.nextDate,
        whichDay: chosen.whichDay,
        daysUntil: diffDays,
    };
}

function firstSundayOfNovember(year) {
    const novFirst = new Date(year, 10, 1);
    const dayOfWeek = novFirst.getDay(); // 0 = Sunday
    const add = (7 - dayOfWeek) % 7;
    novFirst.setDate(novFirst.getDate() + add);
    return novFirst;
}

function localMidnight(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseIsoLocalDate(isoDate) {
    const [y, m, d] = String(isoDate).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

function formatDatePtBr(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}
