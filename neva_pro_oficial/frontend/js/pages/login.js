/**
 * N.E.V.A Pro - Login & Register Logic
 */
import { setSession } from '../core/auth.js';
import { showToast } from '../core/utils.js';
import { api } from '../core/api.js';

export function initLogin() {
    let isRegisterMode = false;

    const loginForm = document.getElementById('loginForm');
    const nameGroup = document.getElementById('name-group');
    const loginExtra = document.getElementById('login-extra');
    const socialSection = document.getElementById('social-section');
    const submitBtn = document.getElementById('submit-btn');
    const togglePrompt = document.getElementById('toggle-mode');
    const loginHeaderH1 = document.querySelector('.login-header h1');
    const loginHeaderP = document.querySelector('.login-header p');

    if (!loginForm) return;

    // Use event delegation for the toggle link
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#toggle-link');
        if (toggleBtn) {
            e.preventDefault();
            toggleAuthMode();
        }
    });

    function toggleAuthMode() {
        isRegisterMode = !isRegisterMode;
        
        if (isRegisterMode) {
            nameGroup.style.display = 'block';
            document.getElementById('name').required = true;
            loginExtra.style.display = 'none';
            socialSection.style.display = 'none';
            submitBtn.textContent = 'Criar minha conta';
            loginHeaderH1.textContent = 'Crie sua conta';
            loginHeaderP.textContent = 'Junte-se ao N.E.V.A Pro e comece sua jornada.';
            togglePrompt.innerHTML = 'Já tem uma conta? <a href="#" id="toggle-link">Faça login</a>';
        } else {
            nameGroup.style.display = 'none';
            document.getElementById('name').required = false;
            loginExtra.style.display = 'flex';
            socialSection.style.display = 'block';
            submitBtn.textContent = 'Entrar na Plataforma';
            loginHeaderH1.textContent = 'Bem-vindo ao N.E.V.A Pro';
            loginHeaderP.textContent = 'Gamifique sua jornada rumo à aprovação e conquiste sua vaga na universidade.';
            togglePrompt.innerHTML = 'Ainda não tem conta? <a href="#" id="toggle-link">Crie sua conta agora</a>';
        }
        
        if (window.lucide) window.lucide.createIcons();
    }

    async function handleAuth(event) {
        event.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const name = isRegisterMode ? document.getElementById('name').value.trim() : null;

        if (!email || !password || (isRegisterMode && !name)) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }

        const endpoint = isRegisterMode ? 'auth/register' : 'auth/login';
        const payload = isRegisterMode ? { name, email, password } : { email, password };

        setButtonLoading(submitBtn, isRegisterMode ? 'Criando...' : 'Entrando...');

        try {
            const data = await api.post(endpoint, payload);
            
            setSession({
                access_token: data.access_token,
                user: data.user
            });

            window.location.href = 'index.html';
        } catch (error) {
            showToast(error.message, 'error');
            resetButtonLoading(submitBtn, isRegisterMode ? 'Criar minha conta' : 'Entrar na Plataforma');
        }
    }

    loginForm.addEventListener('submit', handleAuth);

    // Social Login Setup
    initSocialLogins();
}

function initSocialLogins() {
    const googleBtn = document.getElementById('btn-google-login');
    const appleBtn = document.getElementById('btn-apple-login');

    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerGoogleLogin();
        });
        initGoogleSignIn();
    }

    if (appleBtn) {
        appleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerAppleLogin();
        });
        initAppleSignIn();
    }
}

function setButtonLoading(buttonEl, label) {
    buttonEl.disabled = true;
    buttonEl.innerHTML = `<i data-lucide="loader" class="animate-spin" style="width:18px; height:18px; margin-right:8px;"></i> ${label}`;
    if (window.lucide) window.lucide.createIcons();
}

function resetButtonLoading(buttonEl, originalText) {
    buttonEl.disabled = false;
    buttonEl.textContent = originalText;
    if (window.lucide) window.lucide.createIcons();
}

function isLocalDevEnvironment() {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

async function submitSocialLogin(endpoint, payload, buttonEl) {
    const originalText = buttonEl.textContent;
    setButtonLoading(buttonEl, 'Conectando...');

    try {
        const data = await api.post(endpoint, payload);

        setSession({
            access_token: data.access_token,
            user: data.user
        });

        window.location.href = 'index.html';
    } catch (error) {
        showToast(error.message, 'error');
        resetButtonLoading(buttonEl, originalText);
    }
}

function initGoogleSignIn() {
    const clientId = window.APP_CONFIG?.GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
            const googleBtn = document.getElementById('btn-google-login');
            if (!response?.credential || !googleBtn) return;
            await submitSocialLogin('auth/google', { credential: response.credential }, googleBtn);
        },
        cancel_on_tap_outside: true,
        auto_select: false,
    });
}

function triggerGoogleLogin() {
    if (!window.APP_CONFIG?.GOOGLE_CLIENT_ID) {
        showToast('Login com Google não configurado.', 'warning');
        return;
    }

    if (!window.google?.accounts?.id) {
        showToast('Serviço do Google indisponível.', 'error');
        return;
    }

    window.google.accounts.id.prompt();
}

function initAppleSignIn() {
    if (isLocalDevEnvironment()) return;

    const clientId = window.APP_CONFIG?.APPLE_CLIENT_ID;
    const redirectUri = window.APP_CONFIG?.APPLE_REDIRECT_URI;
    if (!clientId || !redirectUri || !window.AppleID?.auth) return;

    window.AppleID.auth.init({
        clientId,
        scope: 'name email',
        redirectURI: redirectUri,
        state: Math.random().toString(36).substring(7),
        nonce: Math.random().toString(36).substring(7),
        usePopup: true,
    });
}

async function triggerAppleLogin() {
    const appleBtn = document.getElementById('btn-apple-login');
    if (!appleBtn) return;

    if (isLocalDevEnvironment()) {
        // Mock for local dev
        const email = prompt('Email para Mock Login (apenas Localhost):', 'test@example.com');
        if (!email) return;
        
        await submitSocialLogin('auth/apple', {
            identityToken: `mock:${JSON.stringify({ email, name: 'Mock User' })}`,
            user: { name: 'Mock User', email }
        }, appleBtn);
        return;
    }

    if (!window.APP_CONFIG?.APPLE_CLIENT_ID || !window.AppleID?.auth) {
        showToast('Login com Apple não configurado.', 'warning');
        return;
    }

    try {
        const response = await window.AppleID.auth.signIn();
        const identityToken = response?.authorization?.id_token;
        if (!identityToken) throw new Error('Falha ao obter token da Apple.');

        await submitSocialLogin('auth/apple', {
            identityToken,
            authorizationCode: response?.authorization?.code,
            user: response?.user || null
        }, appleBtn);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

