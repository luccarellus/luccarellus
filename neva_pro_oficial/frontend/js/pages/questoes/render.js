/**
 * N.E.V.A Pro - Questions Rendering Module
 */
import { state, DEFAULT_DISCIPLINES } from './state.js';

export function renderYearSelection(container, onSelect) {
    if (!container) return;

    container.innerHTML = `
        <h2 class="animate-fade" style="margin-bottom: 2rem;">Escolha o ano do ENEM</h2>
        <div class="grid grid-4 animate-fade">
            ${state.examsData.map((exam) => `
                <div class="card clickable-card" data-year="${exam.year}">
                    <div class="logo-icon">${String(exam.year).slice(-2)}</div>
                    <h3 class="font-bold">${exam.title || `ENEM ${exam.year}`}</h3>
                    <p class="text-sm text-muted">${(exam.disciplines || DEFAULT_DISCIPLINES).length} disciplinas</p>
                </div>
            `).join('')}
        </div>
    `;

    container.querySelectorAll('.clickable-card').forEach((card) => {
        card.addEventListener('click', () => {
            const year = Number(card.getAttribute('data-year'));
            onSelect(year);
        });
    });
}

export function renderDisciplineSelection(container, onBack, onSelect) {
    const exam = state.examsData.find((item) => Number(item.year) === Number(state.selectedYear)) || {
        disciplines: DEFAULT_DISCIPLINES,
    };

    const disciplineIcons = {
        'ciencias-humanas': { icon: 'globe', color: '#8b5cf6' },
        'ciencias-natureza': { icon: 'microscope', color: '#10b981' },
        linguagens: { icon: 'languages', color: '#3b82f6' },
        matematica: { icon: 'calculator', color: '#f59e0b' },
    };

    container.innerHTML = `
        <div class="flex items-center gap-4" style="margin-bottom: 2rem;">
            <button id="back-to-years" class="btn btn-icon-border"><i data-lucide="arrow-left"></i></button>
            <h2 class="animate-fade">Selecione a Disciplina (${state.selectedYear})</h2>
        </div>
        <div class="grid grid-4 animate-fade">
            ${(exam.disciplines || DEFAULT_DISCIPLINES).map((disc) => {
                const iconInfo = disciplineIcons[disc.value] || { icon: 'book', color: '#64748b' };
                return `
                    <div class="card clickable-disc" data-value="${disc.value}">
                        <div class="icon-circle" style="--icon-color: ${iconInfo.color}">
                            <i data-lucide="${iconInfo.icon}"></i>
                        </div>
                        <h3 class="font-bold">${disc.label}</h3>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('back-to-years').addEventListener('click', onBack);
    container.querySelectorAll('.clickable-disc').forEach((card) => {
        card.addEventListener('click', () => {
            const value = card.getAttribute('data-value');
            onSelect(value);
        });
    });
}

export function renderLoading(container, message, submessage) {
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p class="font-bold">${message}</p>
            <p class="text-sm text-muted">${submessage}</p>
        </div>
    `;
}

export function renderError(container, message, onRetry) {
    container.innerHTML = `
        <div class="error-state animate-fade">
            <h2 class="font-bold">Não foi possível carregar as questões</h2>
            <p class="text-muted">${message}</p>
            <button id="retry-load" class="btn btn-primary">Tentar Novamente</button>
        </div>
    `;

    const retryBtn = document.getElementById('retry-load');
    if (retryBtn) retryBtn.addEventListener('click', onRetry);
}

export function renderQuestion(container, onPrev, onNext, onSelectOption) {
    const question = state.questions[state.currentIndex];
    if (!question) return;

    const totalAnswered = Object.keys(state.userAnswers).length;
    const isLast = state.currentIndex === state.questions.length - 1;
    const selectedLetter = state.userAnswers[state.currentIndex] || null;

    container.innerHTML = `
        <div class="practice-container animate-fade">
            <div class="practice-header">
                <span class="text-sm font-bold text-muted uppercase">Questão ${state.currentIndex + 1} de ${state.questions.length}</span>
                <span id="answered-count" class="text-sm text-muted">Respondidas: ${totalAnswered}/${state.questions.length}</span>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((state.currentIndex + 1) / state.questions.length) * 100}%;"></div>
            </div>

            <div class="question-card card">
                <div class="question-text">${formatQuestionText(question.context || question.title || '')}</div>
            </div>

            <div class="alternatives-section">
                <p class="font-bold intro-text">${formatQuestionText(question.alternativesIntroduction || '')}</p>
                <div id="options-container" class="options-list">
                    ${(question.alternatives || []).map((alt, idx) => {
                        const letter = alt.letter || String.fromCharCode(65 + idx);
                        const isSelected = selectedLetter === letter;
                        const imgUrl = alt.file ? (alt.file.startsWith('//') ? 'https:' + alt.file : alt.file) : '';
                        return `
                            <button class="option-btn ${isSelected ? 'selected' : ''}" data-letter="${letter}">
                                <span class="opt-letter">${letter}</span>
                                <span class="opt-text">${alt.text ? formatQuestionText(alt.text) : (imgUrl ? `<img src="${imgUrl}" alt="Alternativa ${letter}">` : '')}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="practice-actions">
                <button id="prev-q" class="btn btn-secondary" ${state.currentIndex === 0 ? 'disabled' : ''}>Anterior</button>
                <button id="next-q" class="btn btn-primary">${isLast ? 'Finalizar' : 'Próxima'}</button>
            </div>
        </div>
    `;

    setupQuestionEvents(container, onPrev, onNext, onSelectOption);
}

function setupQuestionEvents(container, onPrev, onNext, onSelectOption) {
    container.querySelectorAll('.option-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const letter = button.getAttribute('data-letter');
            onSelectOption(letter);
        });
    });

    document.getElementById('prev-q')?.addEventListener('click', onPrev);
    document.getElementById('next-q')?.addEventListener('click', onNext);
}

export function renderResults(container, onRetry, onChangeDiscipline) {
    const total = state.questions.length;
    let correct = 0;

    state.questions.forEach((question, index) => {
        const selected = state.userAnswers[index];
        const correctAlternative = question.correctAlternative || question.correctAnswer;
        if (selected && selected === correctAlternative) {
            correct += 1;
        }
    });

    const answered = Object.keys(state.userAnswers).length;
    const wrong = answered - correct;
    const unanswered = total - answered;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    container.innerHTML = `
        <div class="results-container animate-fade">
            <div class="card results-card">
                <div class="results-icon">
                    <i data-lucide="check-circle"></i>
                </div>
                <h2 class="font-bold">Simulado Finalizado!</h2>
                <p class="text-muted uppercase text-xs">${state.selectedDiscipline.toUpperCase()} • ENEM ${state.selectedYear}</p>

                <div class="results-grid">
                    <div class="result-box correct">
                        <span class="label">Acertos</span>
                        <span class="value">${correct}</span>
                    </div>
                    <div class="result-box wrong">
                        <span class="label">Erros</span>
                        <span class="value">${wrong}</span>
                    </div>
                    <div class="result-box neutral">
                        <span class="label">Vazias</span>
                        <span class="value">${unanswered}</span>
                    </div>
                    <div class="result-box accent">
                        <span class="label">Precisão</span>
                        <span class="value">${accuracy}%</span>
                    </div>
                </div>

                <div class="results-actions">
                    <button id="retry-practice" class="btn btn-primary">Refazer Simulado</button>
                    <button id="change-discipline" class="btn btn-outline">Nova Disciplina</button>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('retry-practice').addEventListener('click', onRetry);
    document.getElementById('change-discipline').addEventListener('click', onChangeDiscipline);
}

function formatQuestionText(text) {
    if (!text) return '';
    let output = text.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
        const finalUrl = String(url || '').trim().startsWith('//') ? `https:${String(url).trim()}` : String(url).trim();
        return `<img src="${finalUrl}" class="question-image">`;
    });
    output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return output;
}
