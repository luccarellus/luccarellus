/**
 * N.E.V.A Pro - Questions State Management
 */

export const state = {
    selectedYear: null,
    selectedDiscipline: null,
    examsData: [],
    questions: [],
    currentIndex: 0,
    userAnswers: {},
};

export const ALL_YEARS = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];

export const DEFAULT_DISCIPLINES = [
    { label: 'Ciências Humanas e suas Tecnologias', value: 'ciencias-humanas' },
    { label: 'Ciências da Natureza e suas Tecnologias', value: 'ciencias-natureza' },
    { label: 'Linguagens, Códigos e suas Tecnologias', value: 'linguagens' },
    { label: 'Matemática e suas Tecnologias', value: 'matematica' },
];

export const DEFAULT_LANGUAGES = [
    { label: 'Espanhol', value: 'espanhol' },
    { label: 'Inglês', value: 'ingles' },
];

export function updateState(newState) {
    Object.assign(state, newState);
}

export function resetPractice() {
    state.currentIndex = 0;
    state.userAnswers = {};
}

export function saveAnswer(index, letter) {
    state.userAnswers[index] = letter;
}
