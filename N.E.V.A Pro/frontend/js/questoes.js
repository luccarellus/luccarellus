document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3333/api/v1';
    const QUESTION_TARGET = 20;
    const PAGE_SIZE = 100;
    const MAX_OFFSET = 600;

    let selectedYear = null;
    let selectedDiscipline = null;
    let examsData = [];
    let questions = [];
    let currentIndex = 0;
    let userAnswers = {};

    const mainContent = document.getElementById('questoes-flow');

    const defaultDisciplines = [
        { label: 'Ciencias Humanas e suas Tecnologias', value: 'ciencias-humanas' },
        { label: 'Ciencias da Natureza e suas Tecnologias', value: 'ciencias-natureza' },
        { label: 'Linguagens, Codigos e suas Tecnologias', value: 'linguagens' },
        { label: 'Matematica e suas Tecnologias', value: 'matematica' },
    ];

    const defaultLanguages = [
        { label: 'Espanhol', value: 'espanhol' },
        { label: 'Ingles', value: 'ingles' },
    ];

    const allYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
    const fallbackExams = allYears.map((year) => ({
        title: `ENEM ${year}`,
        year,
        disciplines: defaultDisciplines,
        languages: defaultLanguages,
    }));

    fetchExams();

    function normalizeDiscipline(discipline) {
        const value = String(discipline || '').toLowerCase();
        const aliases = {
            humanas: 'ciencias-humanas',
            'ciencias-humanas': 'ciencias-humanas',
            'ciencias-humanas-e-suas-tecnologias': 'ciencias-humanas',
            humanidades: 'ciencias-humanas',
            matematica: 'matematica',
            'matematica-e-suas-tecnologias': 'matematica',
            'ciencias-natureza': 'ciencias-natureza',
            'ciencias-da-natureza': 'ciencias-natureza',
            'ciencias-natureza-e-suas-tecnologias': 'ciencias-natureza',
            linguagens: 'linguagens',
            'linguagens-codigos': 'linguagens',
            'linguagens-e-codigos': 'linguagens',
            'linguagens-e-codigos-e-suas-tecnologias': 'linguagens',
        };
        return aliases[value] || value;
    }

    async function fetchExams() {
        try {
            const response = await fetch(`${API_BASE_URL}/questions/exams`);
            if (!response.ok) throw new Error('Falha ao buscar exames');
            examsData = await response.json();
            if (!Array.isArray(examsData) || examsData.length === 0) {
                examsData = fallbackExams;
            }
        } catch (error) {
            console.warn('Falha ao carregar exames do backend. Usando fallback local.');
            examsData = fallbackExams;
        }

        renderYearSelection();
    }

    function renderYearSelection() {
        mainContent.innerHTML = `
            <h2 class="animate-fade" style="margin-bottom: 2rem;">Escolha o ano do ENEM</h2>
            <div class="grid grid-4 animate-fade">
                ${examsData.map((exam) => `
                    <div class="card clickable-card" data-year="${exam.year}" style="cursor: pointer; text-align: center; padding: 2rem;">
                        <div class="logo-icon" style="margin: 0 auto 1rem; transform: none;">${String(exam.year).slice(-2)}</div>
                        <h3 class="font-bold">${exam.title || `ENEM ${exam.year}`}</h3>
                        <p class="text-sm text-muted">${(exam.disciplines || defaultDisciplines).length} disciplinas</p>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.clickable-card').forEach((card) => {
            card.addEventListener('click', () => {
                selectedYear = Number(card.getAttribute('data-year'));
                renderDisciplineSelection();
            });
        });
    }

    function renderDisciplineSelection() {
        const exam = examsData.find((item) => Number(item.year) === Number(selectedYear)) || {
            disciplines: defaultDisciplines,
        };

        const disciplineIcons = {
            'ciencias-humanas': { icon: 'globe', color: '#8b5cf6' },
            'ciencias-natureza': { icon: 'microscope', color: '#10b981' },
            linguagens: { icon: 'languages', color: '#3b82f6' },
            matematica: { icon: 'calculator', color: '#f59e0b' },
        };

        mainContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 2rem;">
                <button id="back-to-years" class="btn" style="background: none; border: 1px solid var(--border);"><i data-lucide="arrow-left"></i></button>
                <h2 class="animate-fade">Selecione a Disciplina (${selectedYear})</h2>
            </div>
            <div class="grid grid-4 animate-fade">
                ${(exam.disciplines || defaultDisciplines).map((disc) => {
                    const iconInfo = disciplineIcons[disc.value] || { icon: 'book', color: '#64748b' };
                    return `
                        <div class="card clickable-disc" data-value="${disc.value}" style="cursor: pointer; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: ${iconInfo.color}15; color: ${iconInfo.color}; display: flex; align-items: center; justify-content: center;">
                                <i data-lucide="${iconInfo.icon}" style="width: 30px; height: 30px;"></i>
                            </div>
                            <h3 class="font-bold" style="text-align: center; font-size: 1rem;">${disc.label}</h3>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('back-to-years').addEventListener('click', renderYearSelection);
        document.querySelectorAll('.clickable-disc').forEach((card) => {
            card.addEventListener('click', () => {
                selectedDiscipline = card.getAttribute('data-value');
                startPractice();
            });
        });
    }

    async function startPractice() {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 5rem;">
                <div class="logo-icon animate-pulse" style="margin: 0 auto 1.5rem;">E</div>
                <p class="font-bold">Buscando 20 questoes reais do ENEM...</p>
                <p class="text-sm text-muted">Ano: ${selectedYear} | Disciplina: ${selectedDiscipline}</p>
            </div>
        `;

        try {
            const loadedQuestions = await loadDisciplineQuestions(selectedYear, selectedDiscipline, QUESTION_TARGET);
            if (loadedQuestions.length < QUESTION_TARGET) {
                throw new Error(`Quantidade insuficiente de questoes (${loadedQuestions.length}/${QUESTION_TARGET}).`);
            }

            questions = loadedQuestions.slice(0, QUESTION_TARGET);
            currentIndex = 0;
            userAnswers = {};
            renderQuestion();
        } catch (error) {
            console.error('Erro ao carregar questoes reais:', error);
            mainContent.innerHTML = `
                <div class="animate-fade" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 4rem 2rem;">
                    <h2 class="font-bold" style="margin-bottom: 1rem;">Nao foi possivel carregar as 20 questoes reais</h2>
                    <p class="text-muted" style="margin-bottom: 1.5rem;">Verifique se o backend esta ativo e tente novamente.</p>
                    <p class="text-sm text-muted" style="margin-bottom: 2rem;">Backend esperado: http://localhost:3333/api/v1</p>
                    <button id="retry-load" class="btn btn-primary">Tentar Novamente</button>
                </div>
            `;

            const retryBtn = document.getElementById('retry-load');
            if (retryBtn) {
                retryBtn.addEventListener('click', startPractice);
            }
        }
    }

    async function loadDisciplineQuestions(baseYear, discipline, targetCount) {
        const normalizedTarget = normalizeDiscipline(discipline);
        const years = getOrderedYears(baseYear);
        const bucket = [];
        const seen = new Set();

        for (const year of years) {
            for (let offset = 0; offset < MAX_OFFSET; offset += PAGE_SIZE) {
                const pageQuestions = await fetchQuestionPage(year, PAGE_SIZE, offset);
                if (!pageQuestions.length) break;

                for (const question of pageQuestions) {
                    if (normalizeDiscipline(question.discipline) !== normalizedTarget) continue;
                    const key = `${question.year || year}-${question.index || question.title || JSON.stringify(question.alternatives || [])}`;
                    if (seen.has(key)) continue;

                    bucket.push({ ...question, year: question.year || year });
                    seen.add(key);

                    if (bucket.length >= targetCount) {
                        return shuffleArray(bucket).slice(0, targetCount);
                    }
                }

                if (pageQuestions.length < PAGE_SIZE) break;
            }
        }

        return shuffleArray(bucket).slice(0, targetCount);
    }

    function getOrderedYears(baseYear) {
        const yearsFromExams = (Array.isArray(examsData) ? examsData : [])
            .map((exam) => Number(exam.year))
            .filter((year) => Number.isFinite(year));

        const unique = Array.from(new Set([Number(baseYear), ...yearsFromExams, ...allYears]));
        const rest = unique.filter((year) => year !== Number(baseYear)).sort((a, b) => b - a);
        return [Number(baseYear), ...rest];
    }

    async function fetchQuestionPage(year, limit, offset) {
        try {
            const response = await fetch(`${API_BASE_URL}/questions/external?year=${year}&limit=${limit}&offset=${offset}`);
            if (!response.ok) return [];
            const payload = await response.json();
            return Array.isArray(payload) ? payload : (payload.questions || []);
        } catch (error) {
            return [];
        }
    }

    function renderQuestion() {
        const question = questions[currentIndex];
        if (!question) return;

        const totalAnswered = Object.keys(userAnswers).length;
        const isLast = currentIndex === questions.length - 1;
        const selectedLetter = userAnswers[currentIndex] || null;

        mainContent.innerHTML = `
            <div class="animate-fade" style="max-width: 850px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span class="text-sm font-bold text-muted">QUESTAO ${currentIndex + 1} DE ${questions.length}</span>
                    <span id="answered-count" class="text-sm text-muted">Respondidas: ${totalAnswered}/${questions.length}</span>
                </div>

                <div style="width: 100%; height: 8px; border-radius: 999px; background: #e2e8f0; margin-bottom: 1.5rem;">
                    <div style="width: ${((currentIndex + 1) / questions.length) * 100}%; height: 100%; border-radius: 999px; background: var(--primary);"></div>
                </div>

                <div class="card" style="margin-bottom: 1.5rem; line-height: 1.6;">
                    <div style="white-space: pre-wrap;">${formatQuestionText(question.context || question.title || '')}</div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <p class="font-bold" style="margin-bottom: 1rem;">${formatQuestionText(question.alternativesIntroduction || '')}</p>
                    <div id="options-container" style="display: flex; flex-direction: column; gap: 10px;">
                        ${(question.alternatives || []).map((alt, idx) => {
                            const letter = alt.letter || String.fromCharCode(65 + idx);
                            const isSelected = selectedLetter === letter;
                            const imgUrl = alt.file ? (alt.file.startsWith('//') ? `https:${alt.file}` : alt.file) : '';
                            return `
                                <button class="option-btn" data-letter="${letter}" style="text-align: left; padding: 1.25rem; border: 1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}; border-radius: var(--radius-md); background: ${isSelected ? 'rgba(37, 99, 235, 0.06)' : 'white'}; cursor: pointer; transition: all 0.2s; display: flex; gap: 15px;">
                                    <span class="opt-letter" style="font-weight: 800; color: var(--text-muted);">${letter}</span>
                                    <span class="opt-text">${alt.text ? formatQuestionText(alt.text) : (imgUrl ? `<img src="${imgUrl}" style="max-height: 120px;">` : '')}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; gap: 12px;">
                    <button id="prev-q" class="btn btn-primary" ${currentIndex === 0 ? 'disabled' : ''} style="${currentIndex === 0 ? 'opacity: 0.55; cursor: not-allowed;' : ''}">Anterior</button>
                    <button id="next-q" class="btn btn-primary">${isLast ? 'Finalizar' : 'Proxima'}</button>
                </div>
            </div>
        `;

        setupQuestionEvents();
    }

    function setupQuestionEvents() {
        document.querySelectorAll('.option-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const letter = button.getAttribute('data-letter');
                selectOption(letter);
            });
        });

        const prevBtn = document.getElementById('prev-q');
        const nextBtn = document.getElementById('next-q');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex -= 1;
                    renderQuestion();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex === questions.length - 1) {
                    finishPractice();
                    return;
                }
                currentIndex += 1;
                renderQuestion();
            });
        }
    }

    function selectOption(letter) {
        userAnswers[currentIndex] = letter;

        // Avoid full re-render to prevent "blink" on tap/click.
        document.querySelectorAll('.option-btn').forEach((button) => {
            const btnLetter = button.getAttribute('data-letter');
            const isSelected = btnLetter === letter;
            button.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border)';
            button.style.background = isSelected ? 'rgba(37, 99, 235, 0.06)' : 'white';
        });

        const answeredEl = document.getElementById('answered-count');
        if (answeredEl) {
            const totalAnswered = Object.keys(userAnswers).length;
            answeredEl.innerText = `Respondidas: ${totalAnswered}/${questions.length}`;
        }
    }

    function finishPractice() {
        const total = questions.length;
        let correct = 0;

        questions.forEach((question, index) => {
            const selected = userAnswers[index];
            const correctAlternative = question.correctAlternative || question.correctAnswer;
            if (selected && selected === correctAlternative) {
                correct += 1;
            }
        });

        const answered = Object.keys(userAnswers).length;
        const wrong = answered - correct;
        const unanswered = total - answered;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        mainContent.innerHTML = `
            <div class="animate-fade" style="max-width: 760px; margin: 0 auto; text-align: center;">
                <div class="card" style="padding: 2rem;">
                    <h2 class="font-bold" style="margin-bottom: 0.5rem;">Resultado Final - ${selectedYear}</h2>
                    <p class="text-muted" style="margin-bottom: 1.5rem;">Disciplina: ${selectedDiscipline}</p>

                    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 1.5rem;">
                        <div class="card" style="padding: 1rem; background: #ecfdf5; border-color: #a7f3d0;">
                            <p class="text-sm text-muted">Acertos</p>
                            <p class="font-bold" style="font-size: 1.4rem; color: #065f46;">${correct}</p>
                        </div>
                        <div class="card" style="padding: 1rem; background: #fef2f2; border-color: #fecaca;">
                            <p class="text-sm text-muted">Erros</p>
                            <p class="font-bold" style="font-size: 1.4rem; color: #991b1b;">${wrong}</p>
                        </div>
                        <div class="card" style="padding: 1rem;">
                            <p class="text-sm text-muted">Nao respondidas</p>
                            <p class="font-bold" style="font-size: 1.4rem;">${unanswered}</p>
                        </div>
                        <div class="card" style="padding: 1rem;">
                            <p class="text-sm text-muted">Aproveitamento</p>
                            <p class="font-bold" style="font-size: 1.4rem;">${accuracy}%</p>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: center; gap: 12px;">
                        <button id="retry-practice" class="btn btn-primary">Refazer 20 Questoes</button>
                        <button id="change-discipline" class="btn" style="background: none; border: 1px solid var(--border);">Trocar Disciplina</button>
                    </div>
                </div>
            </div>
        `;

        const retryBtn = document.getElementById('retry-practice');
        if (retryBtn) retryBtn.addEventListener('click', startPractice);

        const changeBtn = document.getElementById('change-discipline');
        if (changeBtn) changeBtn.addEventListener('click', renderDisciplineSelection);
    }

    function formatQuestionText(text) {
        if (!text) return '';
        let output = text.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
            const finalUrl = String(url || '').trim().startsWith('//') ? `https:${String(url).trim()}` : String(url).trim();
            return `<img src="${finalUrl}" style="max-width: 100%; border-radius: 8px; margin: 15px 0;">`;
        });
        output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return output;
    }

    function shuffleArray(items) {
        return [...items].sort(() => Math.random() - 0.5);
    }
});
