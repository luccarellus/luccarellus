/**
 * N.E.V.A Pro - Ranking Page Controller
 */
import { api } from '../core/api.js';
import { showToast } from '../core/utils.js';

const FALLBACK_RANKING = [
    { id: '1', username: 'Ana Carolina', xp: 18450, level: 18, accuracy: 91, questionsAnswered: 620 },
    { id: '2', username: 'Bruno Mello', xp: 15200, level: 15, accuracy: 88, questionsAnswered: 540 },
    { id: '3', username: 'Carlos Eduardo', xp: 12800, level: 12, accuracy: 85, questionsAnswered: 480 },
    { id: '4', username: 'Daniela Ferreira', xp: 11000, level: 11, accuracy: 82, questionsAnswered: 420 },
    { id: '5', username: 'Eduardo Lima', xp: 9800, level: 9, accuracy: 79, questionsAnswered: 380 },
    { id: '6', username: 'Fernanda Souza', xp: 8600, level: 8, accuracy: 76, questionsAnswered: 340 },
    { id: '7', username: 'Gabriel Nunes', xp: 7200, level: 7, accuracy: 73, questionsAnswered: 300 },
    { id: '8', username: 'Helena Costa', xp: 6100, level: 6, accuracy: 70, questionsAnswered: 260 },
    { id: '9', username: 'Igor Santos', xp: 5400, level: 5, accuracy: 67, questionsAnswered: 220 },
    { id: '10', username: 'Julia Pereira', xp: 4800, level: 4, accuracy: 64, questionsAnswered: 190 },
];

export async function initRanking() {
    const podiumContainer = document.getElementById('podium-container');
    const listContainer = document.getElementById('ranking-list');
    
    if (!podiumContainer || !listContainer) return;

    let rankingData = [];
    try {
        rankingData = await api.get('ranking');
    } catch (error) {
        console.warn('Falha ao buscar ranking do servidor, usando dados locais.');
        showToast('Ranking carregado em modo offline.', 'info');
        rankingData = FALLBACK_RANKING;
    }

    renderRanking(rankingData, podiumContainer, listContainer);
}

function getInitials(name) {
    return String(name || 'Estudante')
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getDivision(rank) {
    if (rank <= 3) return { label: 'Elite', className: 'div-elite' };
    if (rank <= 7) return { label: 'Diamante', className: 'div-diamond' };
    return { label: 'Platina', className: 'div-platinum' };
}

function renderRanking(data, podiumContainer, listContainer) {
    const processedData = data
        .sort((a, b) => b.xp - a.xp)
        .map((user, index) => ({
            ...user,
            rank: index + 1,
            initials: getInitials(user.username || user.name),
        }));

    // Top 3 in order: 2nd, 1st, 3rd for podium layout
    const top3 = [processedData[1], processedData[0], processedData[2]].filter(Boolean);
    
    podiumContainer.innerHTML = top3
        .map((user) => {
            const crownHtml = user.rank === 1 ? '<i data-lucide="crown" class="crown-icon"></i>' : '';
            return `
                <div class="podium-item" style="${user.rank === 1 ? 'z-index: 10; transform: translateY(-20px);' : ''}">
                    <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                        <div class="podium-name">${user.username || user.name}</div>
                        <div class="podium-xp">${user.xp.toLocaleString()} XP</div>
                        <div class="podium-avatar rank-${user.rank}">
                            ${crownHtml}
                            ${user.initials}
                        </div>
                        <div class="podium-block rank-${user.rank}">${user.rank}</div>
                    </div>
                </div>
            `;
        })
        .join('');

    listContainer.innerHTML = processedData
        .map((user) => {
            const division = getDivision(user.rank);
            const trendIcon = user.rank <= 3 ? 'chevron-up' : (user.rank % 2 === 0 ? 'minus' : 'chevron-down');
            const trendClass = user.rank <= 3 ? 'trend-up' : (user.rank % 2 === 0 ? 'trend-neutral' : 'trend-down');
            const trendValue = user.rank <= 3 ? Math.max(1, 6 - user.rank) : Math.max(1, 4 - (user.rank % 3));

            return `
                <div class="ranking-row">
                    <div class="rank-number">#${user.rank}</div>
                    <div class="rank-trend ${trendClass}">
                        <i data-lucide="${trendIcon}" style="width:12px;"></i>
                        ${trendClass === 'trend-neutral' ? '' : trendValue}
                    </div>
                    <div class="user-info">
                        <div class="avatar-small">${user.initials}</div>
                        <div class="user-details">
                            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px;">
                                <span class="name">${user.username || user.name}</span>
                                <span class="division-badge ${division.className}">${division.label}</span>
                            </div>
                            <span class="level">Nível ${user.level || 1}</span>
                        </div>
                    </div>
                    <div class="xp-info">
                        <i data-lucide="zap"></i>
                        ${user.xp.toLocaleString()} XP
                    </div>
                </div>
            `;
        })
        .join('');

    if (window.lucide) {
        window.lucide.createIcons();
    }
}
