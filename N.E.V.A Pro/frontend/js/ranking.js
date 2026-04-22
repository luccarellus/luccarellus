const API_BASE_URL =
  window.APP_CONFIG?.API_BASE_URL ||
  (['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3333/api/v1'
    : '/api/v1');

document.addEventListener('DOMContentLoaded', () => {
    fetchRanking();
});

async function fetchRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rankingData = await response.json();
        renderRanking(rankingData);
    } catch (error) {
        console.error('Error fetching ranking:', error);
        document.getElementById('ranking-list').innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
                Erro ao carregar o ranking. Tente novamente mais tarde.
            </div>
        `;
    }
}

function renderRanking(data) {
    const podiumContainer = document.getElementById('podium-container');
    const listContainer = document.getElementById('ranking-list');
    
    // Clear containers
    podiumContainer.innerHTML = '';
    listContainer.innerHTML = '';

    // Mock an ID for the current logged in user (in a real app this comes from auth)
    const currentUserId = 4; // Mocking "Estudante" user ID
    
    if (data.length === 0) return;

    // ----- Render Podium (Top 3) -----
    // Podium visual order: 2nd, 1st, 3rd
    const top3 = data.slice(0, 3);
    const podiumOrder = [];
    if (top3[1]) podiumOrder.push({ ...top3[1], rank: 2 });
    if (top3[0]) podiumOrder.push({ ...top3[0], rank: 1 });
    if (top3[2]) podiumOrder.push({ ...top3[2], rank: 3 });

    podiumOrder.forEach(user => {
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

    // ----- Render List (4th onwards) -----
    const remainingUsers = data.slice(3);
    remainingUsers.forEach((user, index) => {
        const rank = index + 4;
        const username = user.username || user.name || 'Estudante';
        const xp = user.xp ?? user.totalXp ?? 0;
        const initial = username.charAt(0).toUpperCase();
        const isCurrentUser = user.id === currentUserId;

        // Mocking extra data for visual polish
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
                        <div style="display: flex; align-items: center;">
                            <span class="name">${username} ${isCurrentUser ? '(Você)' : ''}</span>
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
    
    // Re-initialize lucide icons for newly inserted HTML
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
