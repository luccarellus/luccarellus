let currentQuestions = [];
let currentIndex = 0;
let userAnswers = {};
let timerInterval = null;
let totalSeconds = 5 * 3600 + 30 * 60;
let currentYear = 2023;
let currentDay = 1;
let currentQuestionTotal = 0;

const API_BASE_URL =
  window.APP_CONFIG?.API_BASE_URL ||
  (['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3333/api/v1'
    : '/api/v1');
const QUESTIONS_PER_DISCIPLINE = 20;

document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
        btnStart.addEventListener('click', startSimulado);
    }

    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.addEventListener('click', nextQuestion);

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.addEventListener('click', prevQuestion);
});

async function startSimulado() {
    const year = Number(document.getElementById('select-year').value);
    const day = Number(document.getElementById('select-day').value);

    const btnStart = document.getElementById('btn-start');
    btnStart.innerText = 'Carregando...';
    btnStart.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/simulados/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                year,
                day,
                questionCountPerDiscipline: QUESTIONS_PER_DISCIPLINE,
            }),
        });

        if (!response.ok) {
            throw new Error(`Falha ao iniciar simulado: ${response.status}`);
        }

        const payload = await response.json();
        currentYear = payload.year || year;
        currentDay = payload.day || day;
        currentQuestions = payload.questions || [];
        currentQuestionTotal = payload.totalQuestions || currentQuestions.length;
        totalSeconds = payload.timeLimitSeconds || (currentDay === 1 ? 5 * 3600 + 30 * 60 : 5 * 3600);

        if (!currentQuestions.length) {
            throw new Error('Nenhuma questao retornada pelo backend.');
        }

        if (Array.isArray(payload.missingDisciplines) && payload.missingDisciplines.length > 0) {
            console.warn('Simulado iniciado com disciplinas incompletas.', payload.missingDisciplines);
        }

        currentIndex = 0;
        userAnswers = {};

        document.getElementById('setup-view').style.display = 'none';
        document.getElementById('simulado-view').style.display = 'block';
        document.getElementById('results-view').style.display = 'none';
        document.getElementById('header-title').innerText = `ENEM ${currentYear} - Dia ${currentDay}`;

        renderQuestion();
        startTimer();
    } catch (err) {
        console.error('Error starting simulado:', err);
        alert('Erro ao carregar simulado.');
        btnStart.innerText = 'Iniciar Simulado';
        btnStart.disabled = false;
    }
}

function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        totalSeconds--;
        updateTimerDisplay();
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            finishSimulado(true);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    document.getElementById('time-display').innerText =
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function renderQuestion() {
    const q = currentQuestions[currentIndex];
    if (!q) return;

    document.getElementById('progress-text').innerText = `${currentIndex + 1} / ${currentQuestionTotal || currentQuestions.length}`;
    document.getElementById('progress-fill').style.width = `${((currentIndex + 1) / (currentQuestionTotal || currentQuestions.length)) * 100}%`;
    document.getElementById('btn-prev').disabled = currentIndex === 0;

    const isLast = currentIndex === currentQuestions.length - 1;
    const btnNext = document.getElementById('btn-next');
    if (isLast) {
        btnNext.innerText = 'Finalizar Simulado';
        btnNext.classList.remove('btn-secondary');
        btnNext.classList.add('bg-green-600', 'text-white');
    } else {
        btnNext.innerText = 'Proxima';
        btnNext.className = 'btn btn-primary';
    }

    const disciplineMap = {
        linguagens: 'Linguagens e Codigos',
        matematica: 'Matematica',
        'ciencias-natureza': 'Ciencias da Natureza',
        'ciencias-humanas': 'Ciencias Humanas',
    };

    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="question-card animate-fade">
            <div class="question-header">
                <span class="discipline-badge">${disciplineMap[q.discipline] || q.discipline}</span>
                <span style="font-weight: 700; color: var(--text-secondary);">Questao ${currentIndex + 1}</span>
            </div>

            <div class="question-context">${formatQuestionText(q.context || q.title || '')}</div>
            <div class="question-intro">${formatQuestionText(q.alternativesIntroduction || '')}</div>

            <div class="alternatives">
                ${(q.alternatives || []).map((alt, i) => {
                    const letter = alt.letter || String.fromCharCode(65 + i);
                    const isSelected = userAnswers[currentIndex] === letter;
                    const fileUrl = normalizeAssetUrl(alt.file);
                    return `
                        <button class="alternative-btn ${isSelected ? 'selected' : ''}" data-letter="${letter}" onclick="selectAlternative('${letter}')">
                            <div class="letter-pill">${letter}</div>
                            <div class="alternative-content">${alt.text ? formatQuestionText(alt.text) : (fileUrl ? `<span class="img-wrap"><img src="${fileUrl}" style="max-height: 120px;" loading="lazy" onerror="this.parentElement.classList.add('img-failed'); this.remove();"></span>` : '')}</div>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
}

function formatQuestionText(text) {
    if (!text) return '';
    let output = text.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
        const finalUrl = normalizeAssetUrl(url);
        if (!finalUrl) return '';
        if (String(finalUrl).includes('enem.dev/broken-image.svg')) {
            return '<span class="img-wrap img-failed"></span>';
        }
        return `<span class="img-wrap"><img src="${finalUrl}" loading="lazy" onerror="this.parentElement.classList.add('img-failed'); this.remove();" alt="Imagem da questão"></span>`;
    });
    output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return output;
}

function normalizeAssetUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    return trimmed;
}

function selectAlternative(letter) {
    userAnswers[currentIndex] = letter;

    // Avoid full re-render to prevent screen "blink" on tap/click.
    const container = document.getElementById('question-container');
    if (!container) return;

    container.querySelectorAll('.alternative-btn').forEach((btn) => {
        const btnLetter = btn.getAttribute('data-letter');
        if (btnLetter === letter) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function nextQuestion() {
    if (currentIndex === currentQuestions.length - 1) {
        openFinishModal();
    } else {
        currentIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function openFinishModal() {
    let unanswered = 0;
    for (let i = 0; i < currentQuestions.length; i++) {
        if (!userAnswers[i]) unanswered++;
    }
    document.getElementById('unanswered-count').innerText = unanswered;
    document.getElementById('finish-overlay').style.display = 'flex';
}

function closeFinishModal() {
    document.getElementById('finish-overlay').style.display = 'none';
}

function submitSimulado() {
    finishSimulado(false);
}

async function finishSimulado() {
    clearInterval(timerInterval);
    closeFinishModal();

    let correctCount = 0;
    currentQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        if (userAnswer === (q.correctAnswer || q.correctAlternative)) {
            correctCount++;
        }
    });

    const total = currentQuestions.length;
    const timeLimit = currentDay === 1 ? (5 * 3600 + 30 * 60) : (5 * 3600);
    const timeSpent = timeLimit - totalSeconds;

    let backendResult = null;
    try {
        const response = await fetch(`${API_BASE_URL}/simulados/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correct: correctCount,
                total,
                timeUsedSeconds: timeSpent,
                day: currentDay,
            }),
        });

        if (response.ok) {
            backendResult = await response.json();
        }
    } catch (error) {
        console.warn('Falha ao sincronizar o resultado do simulado.', error);
    }

    const earnedXp = backendResult?.xpEarned ?? (correctCount * 20);
    const accuracy = backendResult?.accuracy ?? (Math.round((correctCount / total) * 100) || 0);
    const resultTimeSpent = backendResult?.timeUsedSeconds ?? timeSpent;
    const h = Math.floor(resultTimeSpent / 3600);
    const m = Math.floor((resultTimeSpent % 3600) / 60);

    document.getElementById('final-score').innerText = correctCount;
    document.getElementById('earned-xp').innerText = earnedXp;
    document.getElementById('accuracy-display').innerText = accuracy + '%';
    document.getElementById('time-spent').innerText =
        `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;

    document.getElementById('simulado-view').style.display = 'none';
    document.getElementById('results-view').style.display = 'block';

    syncXpWithBackend(earnedXp);
}

async function syncXpWithBackend(xp) {
    console.log(`Synced ${xp} XP with backend.`);
}
