/**
 * N.E.V.A Pro - Questions API Module
 */
import { api } from '../../core/api.js';

export async function fetchExams() {
    return await api.get('questions/exams');
}

export async function fetchQuestionPage(year, limit, offset) {
    try {
        const payload = await api.get(`questions/external?year=${year}&limit=${limit}&offset=${offset}`);
        return Array.isArray(payload) ? payload : (payload.questions || []);
    } catch (error) {
        console.error(`Error fetching questions for year ${year}:`, error);
        return [];
    }
}

export function normalizeDiscipline(discipline) {
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

export function shuffleArray(items) {
    return [...items].sort(() => Math.random() - 0.5);
}
