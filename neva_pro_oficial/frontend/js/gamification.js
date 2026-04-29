/**
 * N.E.V.A Pro — Gamification Engine
 * Manages XP, levels, streaks and achievements via localStorage.
 */

const STORAGE_KEY = 'nevaPro_user';
const XP_PER_LEVEL = 1000;

const DEFAULT_USER = {
    name: 'Estudante',
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
    consecutiveCorrect: 0,
    studyTimeMinutes: 0,
    activityLog: [], // { date, xp, reason }
    lastActivityDate: null,
};

// ── Core State ────────────────────────────────────────────
export function getUser() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { ...DEFAULT_USER };
        return { ...DEFAULT_USER, ...JSON.parse(stored) };
    } catch {
        return { ...DEFAULT_USER };
    }
}

export function saveUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

// ── XP Calculation ───────────────────────────────────────
export function xpForLevel(level) {
    return level * XP_PER_LEVEL;
}

export function xpInCurrentLevel(totalXp) {
    const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const xpStart = (level - 1) * XP_PER_LEVEL;
    return totalXp - xpStart;
}

export function xpProgressPercent(totalXp) {
    return (xpInCurrentLevel(totalXp) / XP_PER_LEVEL) * 100;
}

export function calculateLevel(totalXp) {
    return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

// ── Award XP ─────────────────────────────────────────────
export function awardXp(amount, reason = 'QUESTION_CORRECT') {
    const user = getUser();
    const oldLevel = user.level;

    user.totalXp += amount;
    user.level = calculateLevel(user.totalXp);

    // Log activity
    user.activityLog.unshift({ date: new Date().toISOString(), xp: amount, reason });
    if (user.activityLog.length > 50) user.activityLog.pop();

    // Update streak
    const today = new Date().toDateString();
    if (user.lastActivityDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (user.lastActivityDate === yesterday) {
            user.currentStreak += 1;
        } else if (user.lastActivityDate !== today) {
            user.currentStreak = 1;
        }
        user.lastActivityDate = today;
    }

    saveUser(user);

    // Show XP toast
    showXpToast(amount, reason);

    // Check level up
    if (user.level > oldLevel) {
        setTimeout(() => showLevelUpModal(user.level), 600);
    }

    return user;
}

// ── Answer Processing ────────────────────────────────────
export function processAnswer(isCorrect) {
    const user = getUser();
    user.questionsAnswered += 1;

    let xpEarned = 0;
    let reason = '';

    if (isCorrect) {
        user.questionsCorrect += 1;
        user.consecutiveCorrect += 1;
        xpEarned = 50;
        reason = 'QUESTION_CORRECT';

        // Streak bonus
        if (user.consecutiveCorrect > 1) {
            const bonus = Math.min(user.consecutiveCorrect * 10, 100);
            xpEarned += bonus;
            reason = `STREAK_${user.consecutiveCorrect}`;
        }

        // Series bonus: every 5 correct in a row
        if (user.consecutiveCorrect % 5 === 0) {
            xpEarned += 100;
            reason = 'SERIE_BONUS';
        }
    } else {
        user.consecutiveCorrect = 0;
        reason = 'QUESTION_WRONG';
    }

    saveUser(user);

    if (xpEarned > 0) {
        awardXp(xpEarned, reason);
    }

    return { xpEarned, isCorrect, consecutiveCorrect: user.consecutiveCorrect };
}

// ── UI: XP Toast ─────────────────────────────────────────
export function showXpToast(amount, reason = '') {
    const container = document.getElementById('xp-toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = 'xp-toast';

    const labels = {
        QUESTION_CORRECT: '⚡ Resposta correta!',
        QUESTION_WRONG: '❌ Resposta errada',
        SERIE_BONUS: '🔥 Bônus de série!',
    };
    const streakMatch = reason.match(/STREAK_(\d+)/);
    const label = streakMatch
        ? `🔥 ${streakMatch[1]}x em sequência!`
        : (labels[reason] || '⚡');

    toast.innerHTML = `
        <span class="xp-toast-label">${label}</span>
        <span class="xp-toast-amount">+${amount} XP</span>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('xp-toast-visible'), 10);
    setTimeout(() => {
        toast.classList.remove('xp-toast-visible');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'xp-toast-container';
    document.body.appendChild(container);
    return container;
}

// ── UI: Level Up Modal ───────────────────────────────────
export function showLevelUpModal(newLevel) {
    // Remove existing modal
    document.getElementById('level-up-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'level-up-modal';
    modal.className = 'level-up-overlay';
    modal.innerHTML = `
        <div class="level-up-card">
            <div class="level-up-confetti" id="confetti-container"></div>
            <div class="level-up-icon">🏆</div>
            <h2 class="level-up-title">SUBIU DE NÍVEL!</h2>
            <div class="level-up-badge">Nível ${newLevel}</div>
            <p class="level-up-sub">Continue assim! Você está no caminho certo para o sucesso.</p>
            <button class="btn-primary level-up-btn" onclick="document.getElementById('level-up-modal').remove()">
                Continuar estudando ⚡
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('level-up-visible'), 10);
    spawnConfetti();
}

function spawnConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    const colors = ['#2563eb','#f59e0b','#10b981','#8b5cf6','#ef4444','#f97316'];
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 0.8}s;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        container.appendChild(piece);
    }
}

// ── Ranking helpers ──────────────────────────────────────
export function getAccuracyPercent() {
    const user = getUser();
    if (user.questionsAnswered === 0) return 0;
    return Math.round((user.questionsCorrect / user.questionsAnswered) * 100);
}

export function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
}
