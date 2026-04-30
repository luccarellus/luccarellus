/**
 * N.E.V.A Pro - Admin API Bridge
 */
import { api } from '../../core/api.js';

export const AdminApi = {
    // Mural / Notices
    getNotices: () => api.get('mural'),
    createNotice: (data) => api.post('mural', data),
    updateNotice: (id, data) => api.put(`mural/${id}`, data),
    deleteNotice: (id) => api.delete(`mural/${id}`),

    // Materials
    getMaterials: () => api.get('materials'),
    createMaterial: (data) => api.post('materials', data),
    updateMaterial: (id, data) => api.put(`materials/${id}`, data),
    deleteMaterial: (id) => api.delete(`materials/${id}`),

    // Simulados
    getSimulations: () => api.get('simulados/scheduled'),
    createSimulation: (data) => api.post('simulados/scheduled', data),
    updateSimulation: (id, data) => api.put(`simulados/scheduled/${id}`, data),
    deleteSimulation: (id) => api.delete(`simulados/scheduled/${id}`),
};
