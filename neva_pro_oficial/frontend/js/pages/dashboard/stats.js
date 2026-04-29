/**
 * Dashboard User Stats & Countdown
 */

export function updateWelcomeMessage(session) {
    const welcomeEl = document.getElementById('dashboard-welcome-title');
    if (welcomeEl && session?.user) {
        const firstName = session.user.name.split(' ')[0];
        welcomeEl.textContent = `Bem-vindo, ${firstName}! 👋`;
    }
}

export function updateStatsGrid(session) {
    if (!session?.user) return;

    const elements = {
        'dashboard-streak': `${session.user.current_streak || 0} Dias de Streak`,
        'dashboard-level': session.user.level || 1,
        'dashboard-xp': (session.user.total_xp || 0).toLocaleString('pt-BR'),
        'dashboard-questions': session.user.questions_resolved || 0
    };

    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

export function updateEnemCountdown() {
    const countdownEl = document.getElementById('enem-countdown');
    if (!countdownEl) return;

    const now = new Date();
    const schedule = getNextEnemSchedule(now);
    const days = schedule.daysUntil;
    const dayLabel = schedule.whichDay === 1 ? 'Dia 1' : 'Dia 2';
    const dateLabel = formatDatePtBr(schedule.nextDate);

    if (days === 0) {
        countdownEl.textContent = `Hoje é a Prova (${dayLabel})! Boa sorte.`;
    } else if (days === 1) {
        countdownEl.textContent = `Você está a 1 dia da Prova (${dayLabel} - ${dateLabel}). Mantenha o foco!`;
    } else {
        countdownEl.textContent = `Você está a ${days} dias da Prova (${dayLabel} - ${dateLabel}). Mantenha o foco!`;
    }
}

function getNextEnemSchedule(now) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const year = now.getFullYear();
    
    // ENEM is typically the first and second Sunday of November
    let day1 = new Date(year, 10, 1);
    while (day1.getDay() !== 0) {
        day1.setDate(day1.getDate() + 1);
    }
    
    const day2 = new Date(day1);
    day2.setDate(day1.getDate() + 7);

    if (startOfToday <= day1) {
        return { nextDate: day1, whichDay: 1, daysUntil: Math.round((day1 - startOfToday) / 86400000) };
    } else if (startOfToday <= day2) {
        return { nextDate: day2, whichDay: 2, daysUntil: Math.round((day2 - startOfToday) / 86400000) };
    }
    
    // If both passed, look for next year
    const nextYear = year + 1;
    let nextDay1 = new Date(nextYear, 10, 1);
    while (nextDay1.getDay() !== 0) {
        nextDay1.setDate(nextDay1.getDate() + 1);
    }
    return { nextDate: nextDay1, whichDay: 1, daysUntil: Math.round((nextDay1 - startOfToday) / 86400000) };
}

function formatDatePtBr(date) {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}
