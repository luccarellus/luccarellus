document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State
    let currentStep = 'year';
    let selectedYear = null;
    let selectedDiscipline = null;
    let questions = [];
    let currentIndex = 0;
    let examsData = [];

    const mainContent = document.getElementById('questoes-flow');

    // 2. Load Exams Data
    fetchExams();

    const defaultDisciplines = [
      { "label": "Ciências Humanas e suas Tecnologias", "value": "ciencias-humanas" },
      { "label": "Ciências da Natureza e suas Tecnologias", "value": "ciencias-natureza" },
      { "label": "Linguagens, Códigos e suas Tecnologias", "value": "linguagens" },
      { "label": "Matemática e suas Tecnologias", "value": "matematica" }
    ];
    const defaultLanguages = [
      { "label": "Espanhol", "value": "espanhol" },
      { "label": "Inglês", "value": "ingles" }
    ];
    const allYears = [2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010,2009];
    const fallbackExams = allYears.map(y => ({
      "title": `ENEM ${y}`, "year": y,
      "disciplines": defaultDisciplines, "languages": defaultLanguages
    }));

    const API_BASE_URL = 'http://localhost:3333/api/v1';

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
            if (!response.ok) throw new Error();
            examsData = await response.json();
            renderYearSelection();
        } catch (error) {
            console.warn('Backend off, usando dados de reserva local.');
            examsData = fallbackExams;
            renderYearSelection();
        }
    }

    function renderYearSelection() {
        currentStep = 'year';
        mainContent.innerHTML = `
            <h2 class="animate-fade" style="margin-bottom: 2rem;">Escolha o ano do ENEM</h2>
            <div class="grid grid-4 animate-fade">
                ${examsData.map(exam => `
                    <div class="card clickable-card" data-year="${exam.year}" style="cursor: pointer; text-align: center; padding: 2rem;">
                        <div class="logo-icon" style="margin: 0 auto 1rem; transform: none;">${exam.year.toString().slice(-2)}</div>
                        <h3 class="font-bold">${exam.title}</h3>
                        <p class="text-sm text-muted">${exam.disciplines.length} disciplinas</p>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.clickable-card').forEach(card => {
            card.addEventListener('click', () => {
                selectedYear = card.getAttribute('data-year');
                renderDisciplineSelection();
            });
        });
    }

    function renderDisciplineSelection() {
        currentStep = 'discipline';
        const exam = examsData.find(e => e.year == selectedYear);
        
        const disciplineIcons = {
            'ciencias-humanas': { icon: 'globe', color: '#8b5cf6' },
            'ciencias-natureza': { icon: 'microscope', color: '#10b981' },
            'linguagens': { icon: 'languages', color: '#3b82f6' },
            'matematica': { icon: 'calculator', color: '#f59e0b' }
        };

        mainContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 2rem;">
                <button id="back-to-years" class="btn" style="background: none; border: 1px solid var(--border);"><i data-lucide="arrow-left"></i></button>
                <h2 class="animate-fade">Selecione a Disciplina (${selectedYear})</h2>
            </div>
            <div class="grid grid-4 animate-fade">
                ${exam.disciplines.map(disc => {
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

        lucide.createIcons();

        document.getElementById('back-to-years').addEventListener('click', renderYearSelection);
        document.querySelectorAll('.clickable-disc').forEach(card => {
            card.addEventListener('click', () => {
                selectedDiscipline = card.getAttribute('data-value');
                startPractice();
            });
        });
    }

    const fallbackQuestions = [
        {
            discipline: 'matematica',
            context: 'Um agricultor precisa comprar lona para cobrir uma área retangular de 10m x 20m.\n![Imagem Ilustrativa](//encurtador.com.br/exemplo.png)',
            alternativesIntroduction: 'Quantos metros quadrados de lona ele precisará?',
            alternatives: [
                { letter: 'A', text: '50 m²' },
                { letter: 'B', text: '100 m²' },
                { letter: 'C', text: '200 m²' },
                { letter: 'D', text: '300 m²' }
            ],
            correctAlternative: 'C'
        },
        {
            discipline: 'ciencias-humanas',
            context: 'A Revolução Industrial trouxe mudanças significativas para a sociedade contemporânea.',
            alternativesIntroduction: 'O principal elemento que impulsionou a Primeira Revolução Industrial foi:',
            alternatives: [
                { letter: 'A', text: 'O uso da eletricidade.' },
                { letter: 'B', text: 'O motor a vapor e o uso do carvão.' },
                { letter: 'C', text: 'A introdução de computadores.' },
                { letter: 'D', text: 'A descoberta do petróleo.' }
            ],
            correctAlternative: 'B'
        },
        {
            discipline: 'ciencias-natureza',
            context: 'As plantas realizam a fotossíntese para produzir seu próprio alimento.',
            alternativesIntroduction: 'Qual gás é primariamente absorvido pelas plantas nesse processo?',
            alternatives: [
                { letter: 'A', text: 'Oxigênio' },
                { letter: 'B', text: 'Dióxido de Carbono (CO2)' },
                { letter: 'C', text: 'Nitrogênio' },
                { letter: 'D', text: 'Hélio' }
            ],
            correctAlternative: 'B'
        },
        {
            discipline: 'linguagens',
            context: 'No poema de Machado de Assis, as palavras são usadas com duplo sentido.',
            alternativesIntroduction: 'A figura de linguagem que usa palavras de sentido oposto juntas chama-se:',
            alternatives: [
                { letter: 'A', text: 'Metáfora' },
                { letter: 'B', text: 'Paradoxo' },
                { letter: 'C', text: 'Eufemismo' },
                { letter: 'D', text: 'Hipérbole' }
            ],
            correctAlternative: 'B'
        }
    ];

    async function startPractice() {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 5rem;">
                <div class="logo-icon animate-pulse" style="margin: 0 auto 1.5rem;">E</div>
                <p class="font-bold">Buscando questões reais do ENEM...</p>
                <p class="text-sm text-muted">Isso pode levar alguns segundos dependendo da conexão.</p>
            </div>`;
        
        try {
            const response = await fetch(`${API_BASE_URL}/questions/external?year=${selectedYear}&limit=500&offset=0`);
            
            if (!response.ok) throw new Error('Erro na resposta do servidor');
            
            const data = await response.json();
            const pool = Array.isArray(data) ? data : (data.questions || []);
            questions = pool.filter(q => normalizeDiscipline(q.discipline) === selectedDiscipline);
            
            if (questions.length === 0) {
                const retryResponse = await fetch(`${API_BASE_URL}/questions/external?year=${selectedYear}&limit=500&offset=0`);
                const retryData = await retryResponse.json();
                const retryPool = Array.isArray(retryData) ? retryData : (retryData.questions || []);
                questions = retryPool.filter(q => normalizeDiscipline(q.discipline) === selectedDiscipline);
            }

            if (questions.length === 0) throw new Error('Vazio');

            currentIndex = 0;
            renderQuestion();
        } catch (error) {
            console.warn('Erro de conexão ou servidor offline. Carregando dados locais (fallback).');
            questions = fallbackQuestions.filter(q => q.discipline === selectedDiscipline);
            
            if (questions.length === 0) {
                // If the specific discipline has no fallback, use the first available
                questions = [fallbackQuestions[0]];
            }
            
            currentIndex = 0;
            renderQuestion();
        }
    }

    function renderQuestion() {
        if (!questions.length) {
            mainContent.innerHTML = `
                <div class="animate-fade" style="max-width: 800px; margin: 0 auto; text-align: center; padding: 4rem 2rem;">
                    <h2 class="font-bold" style="margin-bottom: 1rem;">Não foi possível carregar questões</h2>
                    <p class="text-muted" style="margin-bottom: 2rem;">Tente selecionar outro ano ou recarregue a página. Se o backend estiver fora do ar, vamos cair no fallback local.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recarregar</button>
                </div>
            `;
            return;
        }

        const q = questions[currentIndex];
        mainContent.innerHTML = `
            <div class="animate-fade" style="max-width: 800px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <span class="text-sm font-bold text-muted">QUESTÃO ${currentIndex + 1} DE ${questions.length}</span>
                    <div style="display: flex; gap: 10px;">
                        <button id="prev-q" class="btn" ${currentIndex === 0 ? 'disabled' : ''} style="background: none; border: 1px solid var(--border);">Anterior</button>
                        <button id="next-q" class="btn" ${currentIndex === questions.length - 1 ? 'disabled' : ''} style="background: none; border: 1px solid var(--border);">Próxima</button>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 2rem; line-height: 1.6;">
                    <div style="white-space: pre-wrap;">${formatQuestionText(q.context || q.title || '')}</div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <p class="font-bold" style="margin-bottom: 1.5rem;">${formatQuestionText(q.alternativesIntroduction || '')}</p>
                    <div id="options-container" style="display: flex; flex-direction: column; gap: 10px;">
                        ${q.alternatives.map(alt => {
                            let imgUrl = alt.file ? (alt.file.startsWith('//') ? 'https:' + alt.file : alt.file) : '';
                            return `
                            <button class="option-btn" data-letter="${alt.letter}" style="text-align: left; padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--radius-md); background: white; cursor: pointer; transition: all 0.2s; display: flex; gap: 15px;">
                                <span class="opt-letter" style="font-weight: 800; color: var(--text-muted);">${alt.letter}</span>
                                <span class="opt-text">${alt.text ? formatQuestionText(alt.text) : (imgUrl ? `<img src="${imgUrl}" style="max-height: 100px;">` : '')}</span>
                            </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div id="feedback-area" style="min-height: 80px;">
                    <button id="submit-ans" class="btn btn-primary" style="width: 100%; padding: 1.25rem; font-size: 1rem;" disabled>Verificar Resposta</button>
                </div>
            </div>
        `;

        setupQuestionEvents();
    }

    function setupQuestionEvents() {
        let selectedBtn = null;
        const submitBtn = document.getElementById('submit-ans');

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (selectedBtn) selectedBtn.style.borderColor = 'var(--border)';
                btn.style.borderColor = 'var(--primary)';
                btn.style.backgroundColor = 'rgba(37, 99, 235, 0.02)';
                selectedBtn = btn;
                submitBtn.disabled = false;
            });
        });

        submitBtn.addEventListener('click', async () => {
            const letter = selectedBtn.getAttribute('data-letter');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Verificando...';

            try {
                // We call our backend for XP and verification
                const response = await fetch(`${API_BASE_URL}/questions/external/answer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: '8ca5ad7d-a169-4509-9fc6-0158a2d15582', // Mock user for now
                        year: parseInt(selectedYear),
                        questionIndex: questions[currentIndex].index,
                        selectedLetter: letter
                    })
                });

                const result = await response.json();
                showFeedback(result.correct, letter);
            } catch (error) {
                console.error('Erro ao enviar resposta:', error);
            }
        });

        document.getElementById('prev-q').addEventListener('click', () => { currentIndex--; renderQuestion(); });
        document.getElementById('next-q').addEventListener('click', () => { currentIndex++; renderQuestion(); });
    }

    function showFeedback(correct, letter) {
        const feedbackArea = document.getElementById('feedback-area');
        const options = document.querySelectorAll('.option-btn');
        
        options.forEach(btn => {
            btn.style.pointerEvents = 'none';
            if (btn.getAttribute('data-letter') === letter) {
                btn.style.backgroundColor = correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                btn.style.borderColor = correct ? '#10b981' : '#ef4444';
            }
        });

        feedbackArea.innerHTML = `
            <div class="animate-fade" style="padding: 1.5rem; border-radius: var(--radius-md); background: ${correct ? '#ecfdf5' : '#fef2f2'}; color: ${correct ? '#065f46' : '#991b1b'}; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p class="font-bold">${correct ? '🎉 Resposta Correta!' : '❌ Ops, não foi dessa vez.'}</p>
                    <p class="text-sm">${correct ? 'Você ganhou +50 XP' : 'Continue estudando que você chega lá!'}</p>
                </div>
                <button class="btn" style="background: white; border: none; color: ${correct ? '#10b981' : '#ef4444'};" onclick="document.getElementById('next-q').click()">Próxima Questão</button>
            </div>
        `;
    }

    function formatQuestionText(text) {
        if (!text) return '';
        // Simple markdown img syntax with protocol auto-fix for //
        let output = text.replace(/!\[.*?\]\((.*?)\)/g, (match, url) => {
            let finalUrl = url.trim();
            if (finalUrl.startsWith('//')) {
                finalUrl = 'https:' + finalUrl;
            }
            return `<img src="${finalUrl}" style="max-width: 100%; border-radius: 8px; margin: 15px 0;">`;
        });
        // Simple markdown bold syntax
        output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return output;
    }
});
