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

function initLayout() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const navbarContainer = document.getElementById('navbar-container');

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
                    <a href="#" class="nav-item">
                        <i data-lucide="files" style="color: #10b981"></i> Materiais
                    </a>
                    <a href="#" class="nav-item">
                        <i data-lucide="message-square" style="color: #3b82f6"></i> Mural
                    </a>
                    <a href="#" class="nav-item">
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
                            <p class="font-bold text-sm">User Name</p>
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
                            <button class="modal-nav-item active"><i data-lucide="user" style="width: 18px;"></i> Perfil</button>
                            <button class="modal-nav-item"><i data-lucide="bell" style="width: 18px;"></i> Notificações</button>
                            <button class="modal-nav-item"><i data-lucide="palette" style="width: 18px;"></i> Aparência</button>
                            <button class="modal-nav-item"><i data-lucide="shield" style="width: 18px;"></i> Privacidade</button>
                        </nav>
                    </div>
                    <div class="modal-body">
                        <div class="modal-header">
                            <h3 class="font-bold text-lg">Seu Perfil</h3>
                            <button class="modal-close" id="btn-close-modal"><i data-lucide="x"></i></button>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <!-- Nome -->
                            <div>
                                <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-secondary);">Nome de Exibição</label>
                                <input type="text" value="User Name" style="width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-family: inherit;">
                            </div>
                            <!-- Meta -->
                            <div>
                                <label style="display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-secondary);">Meta de Horas Diárias</label>
                                <select style="width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-family: inherit;">
                                    <option>2 Horas</option>
                                    <option selected>4 Horas</option>
                                    <option>6 Horas</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" style="align-self: flex-start; margin-top: 1rem;">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

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
}

function initDashboard() {
    // Animating numbers or progress bars could go here
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    progressBars.forEach(bar => {
        const targetHeight = bar.getAttribute('data-height');
        setTimeout(() => {
            bar.style.height = targetHeight + '%';
        }, 100);
    });
}
