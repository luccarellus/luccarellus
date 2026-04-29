/**
 * N.E.V.A Pro - Layout Components
 */
import { getSession, handleLogout, validateAdminAccess, setSession } from '../core/auth.js';

import { loadSettings } from '../core/settings.js';
import { showToast, getApiBaseUrl } from '../core/utils.js';

export async function initLayout() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const navbarContainer = document.getElementById('navbar-container');
    const session = getSession();
    const isAdmin = Boolean(session?.user?.is_admin);

    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <img src="assets/logo.png" alt="N.E.V.A Pro Logo" class="logo-img">
                    <h1 class="font-bold text-xl text-brand">N.E.V.A<span class="text-primary-main"> Pro</span></h1>
                </div>
                <nav class="sidebar-nav">
                    <a href="index.html" class="nav-item ${isActive('index.html') || isHome() ? 'active' : ''}">
                        <i data-lucide="layout-dashboard" class="icon-dashboard"></i> Dashboard
                    </a>
                    <a href="questoes.html" class="nav-item ${isActive('questoes.html') ? 'active' : ''}">
                        <i data-lucide="book-open" class="icon-questions"></i> Questões
                    </a>
                    <a href="simulado.html" class="nav-item ${isActive('simulado.html') ? 'active' : ''}">
                        <i data-lucide="file-text" class="icon-simulations"></i> Simulados
                    </a>
                    <a href="ranking.html" class="nav-item ${isActive('ranking.html') ? 'active' : ''}">
                        <i data-lucide="trophy" class="icon-ranking"></i> Ranking
                    </a>
                    <a href="materiais.html" class="nav-item ${isActive('materiais.html') ? 'active' : ''}">
                        <i data-lucide="files" class="icon-materials"></i> Materiais
                    </a>
                    <a href="mural.html" class="nav-item ${isActive('mural.html') ? 'active' : ''}">
                        <i data-lucide="message-square" class="icon-mural"></i> Mural de recados
                    </a>
                    <a href="calendario.html" class="nav-item ${isActive('calendario.html') ? 'active' : ''}">
                        <i data-lucide="calendar" class="icon-calendar"></i> Calendário
                    </a>
                    ${isAdmin ? `
                    <a href="admin.html" id="nav-backoffice-link" class="nav-item ${isActive('admin.html') ? 'active' : ''}">
                        <i data-lucide="shield-check" class="icon-admin"></i> Backoffice
                    </a>` : ''}
                </nav>
                <div class="sidebar-footer">
                    <a href="#" class="nav-item" id="btn-settings"><i data-lucide="settings"></i> Configurações</a>
                    <a href="#" class="nav-item text-red" id="btn-logout-sidebar"><i data-lucide="log-out"></i> Sair</a>
                </div>
                <div class="footer-sidebar">
                    <p>Instituto Olhar Jovem</p>
                    <p>Copyright © Todos os direitos reservados.</p>
                </div>
            </div>
        `;
    }

    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <header class="navbar">
                <div class="search-bar">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Pesquisar matérias, questões...">
                </div>
                <div class="user-actions">
                    <div class="notification-wrapper">
                        <button class="btn-icon" id="btn-notifications" title="Notificações">
                            <i data-lucide="bell"></i>
                            <span class="badge-dot"></span>
                        </button>
                        <div class="notification-dropdown" id="notification-dropdown">
                            <div class="notification-header">
                                <span class="font-bold">Notificações</span>
                                <button class="btn-link">Marcar como lidas</button>
                            </div>
                            <div class="notification-list">
                                <div class="notification-item unread">
                                    <div class="notification-icon icon-bg-primary">
                                        <i data-lucide="award"></i>
                                    </div>
                                    <div class="notification-content">
                                        <p><strong>+500 XP!</strong> Você finalizou o simulado de Linguagens #4.</p>
                                        <span class="notification-time">1h atrás</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="user-profile">
                        <div class="user-info-desktop">
                            <p class="font-bold text-sm profile-name-row">
                                <span id="nav-username-text">Carregando...</span>
                                <span id="nav-admin-badge" class="badge-admin">Admin</span>
                            </p>
                            <p class="text-muted" id="nav-user-level">Nível 1</p>
                        </div>
                        <button type="button" class="profile-trigger" id="btn-profile-menu" aria-haspopup="menu" aria-expanded="false">
                            <img id="nav-user-avatar" alt="Foto do perfil">
                            <span id="nav-user-avatar-fallback">
                                <i data-lucide="user"></i>
                            </span>
                        </button>
                        <div class="profile-dropdown" id="profile-dropdown" role="menu">
                            <div class="notification-header">
                                <span class="font-bold">Sua Conta</span>
                            </div>
                            <div class="profile-dropdown-inner">
                                <button type="button" class="profile-dropdown-item" id="profile-menu-photo-trigger">
                                    <i data-lucide="image-plus"></i>
                                    Trocar foto
                                </button>
                                <button type="button" class="profile-dropdown-item text-red" id="btn-logout-navbar">
                                    <i data-lucide="log-out"></i>
                                    Sair
                                </button>
                            </div>
                        </div>
                        <input type="file" id="profile-avatar-input" accept="image/*" hidden>
                    </div>
                </div>
            </header>
        `;
    }

    setupLayoutEvents();
}

function isActive(path) {
    return window.location.pathname.includes(path);
}

function isHome() {
    return window.location.pathname === '/' || window.location.pathname.includes('index.html');
}

function setupLayoutEvents() {
    const btnSidebarLogout = document.getElementById('btn-logout-sidebar');
    const btnNavbarLogout = document.getElementById('btn-logout-navbar');
    const backofficeLink = document.getElementById('nav-backoffice-link');
    const btnProfileMenu = document.getElementById('btn-profile-menu');
    const profileDropdown = document.getElementById('profile-dropdown');
    const btnNotifications = document.getElementById('btn-notifications');
    const notificationDropdown = document.getElementById('notification-dropdown');

    [btnSidebarLogout, btnNavbarLogout].forEach(btn => {
        if (btn) btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    });

    if (backofficeLink) {
        backofficeLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const allowed = await validateAdminAccess();
            if (!allowed) {
                showToast('Acesso negado. Este painel é exclusivo para administradores.', 'warning');
                return;
            }
            window.location.href = 'admin.html';
        });
    }

    if (btnProfileMenu && profileDropdown) {
        btnProfileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = profileDropdown.classList.toggle('active');
            btnProfileMenu.setAttribute('aria-expanded', String(isActive));
            if (notificationDropdown) notificationDropdown.classList.remove('active');
        });
    }

    if (btnNotifications && notificationDropdown) {
        btnNotifications.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            if (profileDropdown) profileDropdown.classList.remove('active');
        });
    }

    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('active');
        if (notificationDropdown) notificationDropdown.classList.remove('active');
    });

    const profileAvatarInput = document.getElementById('profile-avatar-input');
    const profileMenuPhotoTrigger = document.getElementById('profile-menu-photo-trigger');

    if (profileMenuPhotoTrigger && profileAvatarInput) {
        profileMenuPhotoTrigger.addEventListener('click', () => profileAvatarInput.click());
        profileAvatarInput.addEventListener('change', handleAvatarChange);
    }
}

async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('Escolha uma imagem válida.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            await saveProfileAvatarToServer(String(reader.result || ''));
            showToast('Foto atualizada com sucesso!', 'success');
        } catch (error) {
            showToast(error.message || 'Erro ao salvar foto.', 'error');
        }
    };
    reader.readAsDataURL(file);
}

async function saveProfileAvatarToServer(avatarUrl) {
    try {
        const updatedUser = await api.patch('users/me', { avatar_url: avatarUrl });
        
        const session = getSession();
        if (session) {
            session.user = { ...(session.user || {}), ...updatedUser };
            setSession(session);
        }
        
        applyProfileAvatar();
        return updatedUser;
    } catch (error) {
        throw new Error(error.message || 'Não foi possível salvar a foto.');
    }
}


export function applyProfileAvatar() {
    const avatarImg = document.getElementById('nav-user-avatar');
    const avatarFallback = document.getElementById('nav-user-avatar-fallback');
    const session = getSession();
    const avatarUrl = session?.user?.avatar_url || '';

    if (!avatarImg || !avatarFallback) return;

    if (avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.style.display = 'block';
        avatarFallback.style.display = 'none';
    } else {
        avatarImg.removeAttribute('src');
        avatarImg.style.display = 'none';
        avatarFallback.style.display = 'flex';
    }
}

export function applySettingsToUI(settings) {
    const nameTextEl = document.getElementById('nav-username-text');
    const adminBadgeEl = document.getElementById('nav-admin-badge');
    const levelEl = document.getElementById('nav-user-level');
    const session = getSession();

    if (nameTextEl) {
        nameTextEl.textContent = session?.user?.name || settings.displayName || 'Estudante';
    }

    if (adminBadgeEl) {
        adminBadgeEl.style.display = session?.user?.is_admin ? 'inline-flex' : 'none';
    }

    if (levelEl && session?.user) {
        levelEl.textContent = `Nível ${session.user.level || 1}`;
    }

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

    applyProfileAvatar();
}
