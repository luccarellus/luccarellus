/**
 * N.E.V.A Pro - Simulado State Management
 */

export const state = {
    currentQuestions: [],
    currentIndex: 0,
    userAnswers: {},
    totalSeconds: 0,
    currentYear: 2023,
    currentDay: 1,
    currentQuestionTotal: 0,
    initialSeconds: 0,
    QUESTIONS_PER_DISCIPLINE: 20
};

const STORAGE_KEY = 'neva_simulado_progress';

export function updateState(newState) {
    Object.assign(state, newState);
    if (state.currentQuestions.length > 0) {
        saveToStorage();
    }
}

export function resetState() {
    state.currentQuestions = [];
    state.currentIndex = 0;
    state.userAnswers = {};
    state.totalSeconds = 0;
    clearStorage();
}

export function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentQuestions: state.currentQuestions,
        currentIndex: state.currentIndex,
        userAnswers: state.userAnswers,
        totalSeconds: state.totalSeconds,
        currentYear: state.currentYear,
        currentDay: state.currentDay,
        currentQuestionTotal: state.currentQuestionTotal,
        initialSeconds: state.initialSeconds
    }));
}

export function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return null;
        }
    }
    return null;
}

export function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
}
