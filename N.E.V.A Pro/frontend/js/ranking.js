const API_BASE_URL =
  window.APP_CONFIG?.API_BASE_URL ||
  (['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3333/api/v1'
    : '/api/v1');

const FALLBACK_RANKING = [
  { id: '1', username: 'Ana Carolina', xp: 18450, level: 18 },
  { id: '2', username: 'Bruno Mello', xp: 15200, level: 15 },
  { id: '3', username: 'Carlos Eduardo', xp: 12800, level: 12 },
  { id: '4', username: 'Daniela Ferreira', xp: 11000, level: 11 },
  { id: '5', username: 'Eduardo Lima', xp: 9800, level: 9 },
  { id: '6', username: 'Fernanda Souza', xp: 8600, level: 8 },
  { id: '7', username: 'Gabriel Nunes', xp: 7200, level: 7 },
  { id: '8', username: 'Helena Costa', xp: 6100, level: 6 },
  { id: '9', username: 'Igor Santos', xp: 5400, level: 5 },
  { id: '10', username: 'Julia Pereira', xp: 4800, level: 4 },
];

document.addEventListener('DOMContentLoaded', () => {
    fetchRanking();
});

function normalizeRankingData(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function getFallbackRanking() {
    return FALLBACK_RANKING.map((user, index) => ({
        ...user,
        initials: user.username
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase(),
        rank: index + 1,
        accuracy: 80 - index,
        questionsAnswered: 620 - index * 35,
    }));
}

async function fetchRanking() {
    const listContainer = document.getElementById('ranking-list');
    if (listContainer) {
        listContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
                Carregando ranking...
            </div>
        `;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/ranking`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rankingData = normalizeRankingData(await response.json());
        renderRanking(rankingData.length > 0 ? rankingData : getFallbackRanking(), rankingData.length === 0 ? 'Mostrando ranking de demonstração.' : '');
    } catch (error) {
        console.error('Error fetching ranking:', error);
        renderRanking(getFallbackRanking(), 'Nao foi possivel carregar o ranking agora. Mostrando dados de demonstracao.');
    }
}

function renderRanking(data, note = '') {
    const podiumContainer = document.getElementById('podium-container');
    const listContainer = document.getElementById('ranking-list');

    if (!podiumContainer || !listContainer) return;

    podiumContainer.innerHTML = '';
    listContainer.innerHTML = '';

    if (note) {
        listContainer.insertAdjacentHTML(
            'beforebegin',
            `
                <div style="margin: 0 0 16px; padding: 12px 16px; border-radius: 14px; background: rgba(37, 99, 235, 0.08); color: var(--text-secondary); border: 1px solid rgba(37, 99, 235, 0.15); text-align: center; font-size: 0.9rem;">
                    ${note}
                </div>
            `,
        );
    }

    if (!Array.isArray(data) || data.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
                Ranking indisponivel no momento.
            </div>
        `;
        return;
    }

    const currentUserId = 4;
    const top3 = data.slice(0, 3);
    const podiumOrder = [];
    if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2 });
    if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1 });
    if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3 });

    podiumOrder.forEach((user) => {
        const username = user.username || user.name || 'Estudante';
        const xp = user.xp ?? user.totalXp ?? 0;
        const initial = username.charAt(0).toUpperCase();

        let crownHtml = '';
        if (user.rank === 1) {
            crownHtml = `<i data-lucide="crown" class="crown-icon"></i>`;
        }

        const podiumHtml = `
            <div class="podium-item" style="${user.rank === 1 ? 'z-index: 10; transform: translateY(-20px);' : ''}">
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <div class="podium-name">${username}</div>
                    <div class="podium-xp">${xp.toLocaleString()} XP</div>
                    <div class="podium-avatar rank-${user.rank}">
                        ${crownHtml}
                        ${initial}
                    </div>
                    <div class="podium-block rank-${user.rank}">
                        ${user.rank}
                    </div>
                </div>
            </div>
        `;
        podiumContainer.insertAdjacentHTML('beforeend', podiumHtml);
    });

    const remainingUsers = data.slice(3);
    remainingUsers.forEach((user, index) => {
        const rank = index + 4;
        const username = user.username || user.name || 'Estudante';
        const xp = user.xp ?? user.totalXp ?? 0;
        const initial = username.charAt(0).toUpperCase();
        const isCurrentUser = user.id === currentUserId;

        const trends = ['up', 'down', 'neutral'];
        const trend = trends[Math.floor(Math.random() * 3)];
        const trendVal = Math.floor(Math.random() * 5) + 1;

        let trendHtml = '';
        if (trend === 'up') trendHtml = `<div class="rank-trend trend-up"><i data-lucide="chevron-up" style="width:12px;"></i>${trendVal}</div>`;
        else if (trend === 'down') trendHtml = `<div class="rank-trend trend-down"><i data-lucide="chevron-down" style="width:12px;"></i>${trendVal}</div>`;
        else trendHtml = `<div class="rank-trend trend-neutral"><i data-lucide="minus" style="width:12px;"></i></div>`;

        const division = rank < 10 ? 'Elite' : (rank < 20 ? 'Diamante' : 'Platina');
        const divClass = rank < 10 ? 'div-elite' : (rank < 20 ? 'div-diamond' : 'div-platinum');

        const rowHtml = `
            <div class="ranking-row ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank-number">#${rank}</div>
                ${trendHtml}
                <div class="user-info">
                    <div class="avatar-small">${initial}</div>
                    <div class="user-details">
                        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px;">
                            <span class="name">${username}${isCurrentUser ? ' (Você)' : ''}</span>
                            <span class="division-badge ${divClass}">${division}</span>
                        </div>
                        <span class="level">Nível ${user.level || 10}</span>
                    </div>
                </div>
                <div class="xp-info">
                    <i data-lucide="zap"></i>
                    ${xp.toLocaleString()} XP
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', rowHtml);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
}
