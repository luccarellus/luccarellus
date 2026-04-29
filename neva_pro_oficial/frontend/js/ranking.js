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

document.addEventListener('DOMContentLoaded', () => {
  renderRanking();
});

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
  if (rank < 10) return { label: 'Elite', className: 'div-elite' };
  if (rank < 20) return { label: 'Diamante', className: 'div-diamond' };
  return { label: 'Platina', className: 'div-platinum' };
}

function renderRanking() {
  const podiumContainer = document.getElementById('podium-container');
  const listContainer = document.getElementById('ranking-list');
  if (!podiumContainer || !listContainer) return;

  const data = FALLBACK_RANKING.map((user, index) => ({
    ...user,
    rank: index + 1,
    initials: getInitials(user.username),
  }));

  const top3 = [data[1], data[0], data[2]].filter(Boolean);
  const podiumHtml = top3
    .map((user) => {
      const crownHtml = user.rank === 1 ? '<i data-lucide="crown" class="crown-icon"></i>' : '';
      return `
        <div class="podium-item" style="${user.rank === 1 ? 'z-index: 10; transform: translateY(-20px);' : ''}">
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div class="podium-name">${user.username}</div>
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

  const rowsHtml = data
    .map((user, index) => {
      const rank = index + 1;
      const division = getDivision(rank);
      const trendIcon = rank <= 3 ? 'chevron-up' : (rank % 2 === 0 ? 'minus' : 'chevron-down');
      const trendClass = rank <= 3 ? 'trend-up' : (rank % 2 === 0 ? 'trend-neutral' : 'trend-down');
      const trendValue = rank <= 3 ? Math.max(1, 6 - rank) : Math.max(1, 4 - (rank % 3));

      return `
        <div class="ranking-row">
          <div class="rank-number">#${rank}</div>
          <div class="rank-trend ${trendClass}">
            <i data-lucide="${trendIcon}" style="width:12px;"></i>
            ${trendClass === 'trend-neutral' ? '' : trendValue}
          </div>
          <div class="user-info">
            <div class="avatar-small">${user.initials}</div>
            <div class="user-details">
              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px;">
                <span class="name">${user.username}</span>
                <span class="division-badge ${division.className}">${division.label}</span>
              </div>
              <span class="level">Nível ${user.level}</span>
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

  podiumContainer.innerHTML = podiumHtml;
  listContainer.innerHTML = rowsHtml;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
