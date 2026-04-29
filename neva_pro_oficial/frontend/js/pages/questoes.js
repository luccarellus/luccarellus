/**
 * N.E.V.A Pro - Practice Questions Page Controller
 */
import { state, updateState } from './questoes/state.js';
import { fetchExams, fetchQuestionPage, normalizeDiscipline, shuffleArray } from './questoes/api.js';
import {
    renderYearSelection,
    renderDisciplineSelection,
    renderLoading,
    renderError,
    renderQuestion,
    renderResults
} from './questoes/render.js';
import { showToast } from '../core/utils.js';

let mainContent = null;
const QUESTION_TARGET = 20;
const PAGE_SIZE = 50;
const MAX_OFFSET = 500;

export function initQuestoes() {
    mainContent = document.getElementById('questoes-flow');
    if (!mainContent) return;

    loadInitialData();
}

async function loadInitialData() {
    renderLoading(mainContent, 'Carregando exames...', 'Buscando dados do ENEM');
    try {
        const exams = await fetchExams();
        updateState({ examsData: exams });
        showYearSelection();
    } catch (error) {
        renderError(mainContent, 'Erro ao carregar exames. Verifique sua conexão.', loadInitialData);
    }
}

function showYearSelection() {
    renderYearSelection(mainContent, (year) => {
        updateState({ selectedYear: year });
        showDisciplineSelection();
    });
}

function showDisciplineSelection() {
    renderDisciplineSelection(
        mainContent,
        showYearSelection,
        (discipline) => {
            updateState({ selectedDiscipline: discipline });
            startPractice();
        }
    );
}

async function startPractice() {
    renderLoading(
        mainContent,
        `Buscando ${QUESTION_TARGET} questões reais do ENEM...`,
        `Ano: ${state.selectedYear} | Disciplina: ${state.selectedDiscipline}`
    );

    try {
        const loadedQuestions = await loadDisciplineQuestions(state.selectedYear, state.selectedDiscipline, QUESTION_TARGET);
        if (loadedQuestions.length < 1) {
            throw new Error(`Nenhuma questão encontrada para este filtro.`);
        }

        updateState({
            questions: loadedQuestions.slice(0, QUESTION_TARGET),
            currentIndex: 0,
            userAnswers: {}
        });

        showQuestion();
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        renderError(mainContent, error.message, startPractice);
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
    const yearsFromExams = (Array.isArray(state.examsData) ? state.examsData : [])
        .map((exam) => Number(exam.year))
        .filter((year) => Number.isFinite(year));

    const allYearsFallback = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
    const unique = Array.from(new Set([Number(baseYear), ...yearsFromExams, ...allYearsFallback]));
    const rest = unique.filter((year) => year !== Number(baseYear)).sort((a, b) => b - a);
    return [Number(baseYear), ...rest];
}

function showQuestion() {
    renderQuestion(
        mainContent,
        handlePrevQuestion,
        handleNextQuestion,
        handleSelectOption
    );
}

function handlePrevQuestion() {
    if (state.currentIndex > 0) {
        updateState({ currentIndex: state.currentIndex - 1 });
        showQuestion();
    }
}

function handleNextQuestion() {
    if (state.currentIndex === state.questions.length - 1) {
        showResults();
        return;
    }
    updateState({ currentIndex: state.currentIndex + 1 });
    showQuestion();
}

function handleSelectOption(letter) {
    const newUserAnswers = { ...state.userAnswers, [state.currentIndex]: letter };
    updateState({ userAnswers: newUserAnswers });

    // Update UI immediately for selection feedback
    mainContent.querySelectorAll('.option-btn').forEach((button) => {
        const btnLetter = button.getAttribute('data-letter');
        button.classList.toggle('selected', btnLetter === letter);
    });

    const answeredEl = document.getElementById('answered-count');
    if (answeredEl) {
        answeredEl.innerText = `Respondidas: ${Object.keys(newUserAnswers).length}/${state.questions.length}`;
    }
}

function showResults() {
    renderResults(
        mainContent,
        startPractice,
        showDisciplineSelection
    );
}
