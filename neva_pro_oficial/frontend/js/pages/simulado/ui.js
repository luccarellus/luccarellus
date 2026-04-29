/**
 * N.E.V.A Pro - Simulado UI Rendering
 */
import { state } from './state.js';

export function renderQuestion(onSelectAlternative) {
    const q = state.currentQuestions[state.currentIndex];
    if (!q) return;

    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (progressText) progressText.innerText = `${state.currentIndex + 1} / ${state.currentQuestionTotal || state.currentQuestions.length}`;
    if (progressFill) progressFill.style.width = `${((state.currentIndex + 1) / (state.currentQuestionTotal || state.currentQuestions.length)) * 100}%`;
    if (btnPrev) btnPrev.disabled = state.currentIndex === 0;

    const isLast = state.currentIndex === state.currentQuestions.length - 1;
    if (btnNext) {
        if (isLast) {
            btnNext.innerText = 'Finalizar Simulado';
            btnNext.className = 'btn btn-primary';
            btnNext.style.background = '#10b981';
            btnNext.style.borderColor = '#10b981';
        } else {
            btnNext.innerText = 'Próxima';
            btnNext.className = 'btn btn-primary';
            btnNext.style.background = '';
            btnNext.style.borderColor = '';
        }
    }

    const disciplineMap = {
        linguagens: 'Linguagens e Códigos',
        matematica: 'Matemática',
        'ciencias-natureza': 'Ciências da Natureza',
        'ciencias-humanas': 'Ciências Humanas',
    };

    const container = document.getElementById('question-container');
    if (!container) return;

    container.innerHTML = `
        <div class="question-card animate-fade">
            <div class="question-header">
                <span class="discipline-badge">${disciplineMap[q.discipline] || q.discipline}</span>
                <span style="font-weight: 700; color: var(--text-secondary);">Questão ${state.currentIndex + 1}</span>
            </div>

            <div class="question-context">${formatQuestionText(q.context || q.title || '')}</div>
            <div class="question-intro">${formatQuestionText(q.alternativesIntroduction || '')}</div>

            <div class="alternatives">
                ${(q.alternatives || []).map((alt, i) => {
                    const letter = alt.letter || String.fromCharCode(65 + i);
                    const isSelected = state.userAnswers[state.currentIndex] === letter;
                    const fileUrl = normalizeAssetUrl(alt.file);
                    return `
                        <button class="alternative-btn ${isSelected ? 'selected' : ''}" data-letter="${letter}">
                            <div class="letter-pill">${letter}</div>
                            <div class="alternative-content">
                                ${alt.text ? formatQuestionText(alt.text) : (fileUrl ? `<span class="img-wrap"><img src="${fileUrl}" style="max-height: 120px;" loading="lazy"></span>` : '')}
                            </div>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    container.querySelectorAll('.alternative-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const letter = btn.getAttribute('data-letter');
            onSelectAlternative(letter, container);
        });
    });

    if (window.lucide) window.lucide.createIcons();
}

export function showResults(correctCount, earnedXp, accuracy, timeSpentStr) {
    const finalScoreEl = document.getElementById('final-score');
    const earnedXpEl = document.getElementById('earned-xp');
    const accuracyEl = document.getElementById('accuracy-display');
    const timeSpentEl = document.getElementById('time-spent');

    if (finalScoreEl) finalScoreEl.innerText = correctCount;
    if (earnedXpEl) earnedXpEl.innerText = earnedXp;
    if (accuracyEl) accuracyEl.innerText = accuracy + '%';
    if (timeSpentEl) timeSpentEl.innerText = timeSpentStr;

    document.getElementById('simulado-view').style.display = 'none';
    document.getElementById('results-view').style.display = 'block';
}

export function openFinishModal(unansweredCount) {
    const countEl = document.getElementById('unanswered-count');
    if (countEl) countEl.innerText = unansweredCount;
    
    const overlay = document.getElementById('finish-overlay');
    if (overlay) overlay.style.display = 'flex';
}

export function closeFinishModal() {
    const overlay = document.getElementById('finish-overlay');
    if (overlay) overlay.style.display = 'none';
}

function formatQuestionText(text) {
    if (!text) return '';
    let output = text.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
        const finalUrl = normalizeAssetUrl(url);
        if (!finalUrl) return '';
        return `<span class="img-wrap"><img src="${finalUrl}" loading="lazy" alt="Imagem da questão" onerror="this.style.display='none'"></span>`;
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
