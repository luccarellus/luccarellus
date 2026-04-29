/**
 * N.E.V.A Pro - Admin State Management
 */

const STORAGE_KEYS = {
    notices: 'nevapro_admin_notices_v3',
    materials: 'nevapro_admin_materials_v3',
    simulations: 'nevapro_admin_simulations_v3',
};

const defaultState = {
    notices: [
        { title: 'Novo Simulado Nacional: Pré-ENEM 2026', category: 'official', tag: 'Aviso', body: 'As inscrições seguem abertas até sexta-feira.', createdAt: '2026-04-20T08:00:00.000Z', updatedAt: '2026-04-20T08:00:00.000Z' },
        { title: 'Agenda semanal atualizada', category: 'agenda', tag: 'Prazo', body: 'Simulado global, revisão de conteúdos e redação já estão organizados.', createdAt: '2026-04-19T12:00:00.000Z', updatedAt: '2026-04-21T12:00:00.000Z' },
        { title: 'Roteiro de estudos liberado', category: 'study', tag: 'Guia', body: 'Roteiro ajustado para reduzir dispersão e aumentar consistência diária.', createdAt: '2026-04-18T10:00:00.000Z', updatedAt: '2026-04-18T10:00:00.000Z' },
    ],
    materials: [
        { title: 'Lista de revisão de Matemática', type: 'pdf', grade: 'ENEM geral', link: '#', description: 'Resumo dos tópicos mais cobrados com foco em exercícios.', createdAt: '2026-04-19T10:00:00.000Z', updatedAt: '2026-04-19T10:00:00.000Z' },
        { title: 'Checklist da redação', type: 'lista', grade: '3º ano', link: '#', description: 'Sequência de revisão para a semana de entrega.', createdAt: '2026-04-20T10:00:00.000Z', updatedAt: '2026-04-21T09:00:00.000Z' },
        { title: 'Roteiro de Linguagens', type: 'resumo', grade: 'ENEM geral', link: '#', description: 'Guia para leitura, interpretação e análise de texto.', createdAt: '2026-04-18T15:00:00.000Z', updatedAt: '2026-04-18T15:00:00.000Z' },
    ],
    simulations: [
        { title: 'Simulado Nacional Pré-ENEM', date: '2026-11-01', questions: 20, audience: 'all', note: 'Liberar para todos os alunos.', createdAt: '2026-04-20T09:00:00.000Z', updatedAt: '2026-04-22T09:00:00.000Z' },
        { title: 'Simulado de Linguagens', date: '2026-05-04', questions: 15, audience: 'beta', note: 'Apenas grupo beta para validação.', createdAt: '2026-04-18T13:00:00.000Z', updatedAt: '2026-04-18T13:00:00.000Z' },
        { title: 'Bloco de Ciências da Natureza', date: '2026-05-10', questions: 20, audience: 'premium', note: 'Organizado para turma avançada.', createdAt: '2026-04-19T16:00:00.000Z', updatedAt: '2026-04-20T16:00:00.000Z' },
    ],
};

export const state = {
    notices: [],
    materials: [],
    simulations: [],
    currentEditing: {
        notices: null,
        materials: null,
        simulations: null
    }
};

export function loadState() {
    Object.keys(STORAGE_KEYS).forEach(key => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS[key]);
            const parsed = raw ? JSON.parse(raw) : null;
            state[key] = (Array.isArray(parsed) ? parsed : [...defaultState[key]]).map(normalizeItem);
        } catch (e) {
            console.error(`Error loading ${key}:`, e);
            state[key] = [...defaultState[key]].map(normalizeItem);
        }
    });
}

export function saveState() {
    Object.keys(STORAGE_KEYS).forEach(key => {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(state[key]));
    });
    
    // Dispatch a custom event to notify other modules of state changes
    window.dispatchEvent(new CustomEvent('admin-state-changed', { detail: state }));
}

function normalizeItem(item) {
    const now = new Date().toISOString();
    return {
        ...item,
        createdAt: item.createdAt || now,
        updatedAt: item.updatedAt || item.createdAt || now,
    };
}

export function getNowIso() {
    return new Date().toISOString();
}
