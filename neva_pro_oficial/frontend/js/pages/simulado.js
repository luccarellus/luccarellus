/**
 * N.E.V.A Pro - Simulado Page Controller
 */
import { api } from '../core/api.js';
import { showToast } from '../core/utils.js';
import { state, updateState, resetState, loadFromStorage, clearStorage } from './simulado/state.js';
import { startTimer, stopTimer, getTimeSpent } from './simulado/timer.js';
import { renderQuestion, showResults, openFinishModal, closeFinishModal } from './simulado/ui.js';

export function initSimulado() {
    const btnStart = document.getElementById('btn-start');
    if (btnStart) btnStart.addEventListener('click', handleStartSimulado);

    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.addEventListener('click', nextQuestion);

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.addEventListener('click', prevQuestion);

    const btnCancelFinish = document.getElementById('btn-cancel-finish');
    if (btnCancelFinish) btnCancelFinish.addEventListener('click', closeFinishModal);

    const btnConfirmFinish = document.getElementById('btn-confirm-finish');
    if (btnConfirmFinish) btnConfirmFinish.addEventListener('click', submitSimulado);

    const saved = loadFromStorage();
    if (saved && saved.currentQuestions && saved.currentQuestions.length > 0) {
        if (confirm('Você possui um simulado em andamento. Deseja continuar de onde parou?')) {
            updateState(saved);
            document.getElementById('setup-view').style.display = 'none';
            document.getElementById('simulado-view').style.display = 'block';
            document.getElementById('header-title').innerText = `ENEM ${state.currentYear} - Dia ${state.currentDay}`;
            renderQuestion(handleSelectAlternative);
            startTimer(null, finishSimulado);
        } else {
            clearStorage();
        }
    }
}

async function handleStartSimulado() {
    const yearSelect = document.getElementById('select-year');
    const daySelect = document.getElementById('select-day');
    
    if (!yearSelect || !daySelect) return;

    const year = Number(yearSelect.value);
    const day = Number(daySelect.value);

    const btnStart = document.getElementById('btn-start');
    btnStart.innerText = 'Carregando...';
    btnStart.disabled = true;

    try {
        const payload = await api.post('simulados/start', {
            year,
            day,
            questionCountPerDiscipline: state.QUESTIONS_PER_DISCIPLINE,
        });

        const timeLimit = payload.timeLimitSeconds || (day === 1 ? 5 * 3600 + 30 * 60 : 5 * 3600);
 
        updateState({
            currentYear: payload.year || year,
            currentDay: payload.day || day,
            currentQuestions: payload.questions || [],
            currentQuestionTotal: payload.totalQuestions || (payload.questions || []).length,
            totalSeconds: timeLimit,
            initialSeconds: timeLimit,
            currentIndex: 0,
            userAnswers: {}
        });

        if (!state.currentQuestions.length) {
            throw new Error('Nenhuma questão retornada pelo backend.');
        }

        document.getElementById('setup-view').style.display = 'none';
        document.getElementById('simulado-view').style.display = 'block';
        document.getElementById('results-view').style.display = 'none';
        document.getElementById('header-title').innerText = `ENEM ${state.currentYear} - Dia ${state.currentDay}`;

        renderQuestion(handleSelectAlternative);
        startTimer(null, finishSimulado);
    } catch (err) {
        console.error('Error starting simulado:', err);
        showToast('Erro ao carregar simulado. Verifique sua conexão.', 'error');
        btnStart.innerText = 'Iniciar Simulado';
        btnStart.disabled = false;
    }
}

function handleSelectAlternative(letter, container) {
    const newUserAnswers = { ...state.userAnswers, [state.currentIndex]: letter };
    updateState({ userAnswers: newUserAnswers });

    container.querySelectorAll('.alternative-btn').forEach((btn) => {
        const btnLetter = btn.getAttribute('data-letter');
        btn.classList.toggle('selected', btnLetter === letter);
    });
}

function nextQuestion() {
    if (state.currentIndex === state.currentQuestions.length - 1) {
        handleOpenFinishModal();
    } else {
        updateState({ currentIndex: state.currentIndex + 1 });
        renderQuestion(handleSelectAlternative);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevQuestion() {
    if (state.currentIndex > 0) {
        updateState({ currentIndex: state.currentIndex - 1 });
        renderQuestion(handleSelectAlternative);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function handleOpenFinishModal() {
    let unanswered = 0;
    for (let i = 0; i < state.currentQuestions.length; i++) {
        if (!state.userAnswers[i]) unanswered++;
    }
    openFinishModal(unanswered);
}

function submitSimulado() {
    finishSimulado();
}

async function finishSimulado() {
    stopTimer();
    closeFinishModal();

    let correctCount = 0;
    state.currentQuestions.forEach((q, index) => {
        const userAnswer = state.userAnswers[index];
        const correct = q.correctAnswer || q.correctAlternative;
        if (userAnswer === correct) {
            correctCount++;
        }
    });

    const total = state.currentQuestions.length;
    const timeSpent = getTimeSpent();

    let backendResult = null;
    try {
        backendResult = await api.post('simulados/finish', {
            correct: correctCount,
            total,
            timeUsedSeconds: timeSpent,
            day: state.currentDay,
        });
    } catch (error) {
        console.warn('Falha ao sincronizar o resultado do simulado.', error);
        showToast('Não foi possível salvar o resultado online. Progresso salvo localmente.', 'warning');
    }

    const earnedXp = backendResult?.xpEarned ?? (correctCount * 20);
    const accuracy = backendResult?.accuracy ?? (Math.round((correctCount / total) * 100) || 0);
    const resultTimeSpent = backendResult?.timeUsedSeconds ?? timeSpent;
    
    const h = Math.floor(resultTimeSpent / 3600);
    const m = Math.floor((resultTimeSpent % 3600) / 60);
    const timeSpentStr = `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;

    showResults(correctCount, earnedXp, accuracy, timeSpentStr);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
