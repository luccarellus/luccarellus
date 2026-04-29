/**
 * Mural Page Module
 * Handles notice filtering and category selection
 */

const summaryMap = {
    all: {
        title: 'Tudo',
        desc: 'Acompanhe os comunicados institucionais e as orientações do projeto em um só lugar.',
        count: '4 recados',
        countDesc: 'Publicações ativas',
        actionTitle: 'Canal oficial',
        actionDesc: 'Leitura rápida e objetiva',
        action: 'Abrir painel',
    },
    official: {
        title: 'Avisos oficiais',
        desc: 'Comunicados institucionais, inscrições, mudanças e prazos importantes.',
        count: '1 aviso',
        countDesc: 'Atualização recente',
        actionTitle: 'Prioridade máxima',
        actionDesc: 'Leia antes de seguir para as atividades',
        action: 'Abrir avisos',
    },
    agenda: {
        title: 'Agenda',
        desc: 'Simulados, revisões e entregas organizadas por data para você não perder nada.',
        count: '1 evento',
        countDesc: 'Compromissos da semana',
        actionTitle: 'Organização',
        actionDesc: 'Veja os marcos da semana',
        action: 'Ver agenda',
    },
    study: {
        title: 'Estudos',
        desc: 'Roteiros pedagógicos e orientações para manter a rotina de revisão em dia.',
        count: '1 roteiro',
        countDesc: 'Orientação de estudo',
        actionTitle: 'Foco',
        actionDesc: 'Use como guia de estudo',
        action: 'Abrir roteiro',
    },
    support: {
        title: 'Apoio',
        desc: 'Dicas rápidas, FAQ e ajuda para quando você precisar resolver algo sem perder tempo.',
        count: '1 guia',
        countDesc: 'Ajuda rápida',
        actionTitle: 'Atendimento',
        actionDesc: 'Consulte antes de abrir uma dúvida',
        action: 'Abrir FAQ',
    },
};

export function initMural() {
    console.log('Initializing Mural page...');
    
    const filterItems = Array.from(document.querySelectorAll('.filter-item[data-filter]'));
    const cards = Array.from(document.querySelectorAll('.notice-card[data-category]'));
    const emptyState = document.getElementById('empty-state');

    function applyFilter(filterKey) {
        const data = summaryMap[filterKey] || summaryMap.all;

        filterItems.forEach((item) => item.classList.toggle('active', item.dataset.filter === filterKey));

        let visible = 0;
        cards.forEach((card) => {
            const match = filterKey === 'all' || card.dataset.category === filterKey;
            card.style.display = match ? '' : 'none';
            if (match) visible += 1;
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }

        const titleEl = document.getElementById('category-detail-title');
        const descEl = document.getElementById('category-detail-desc');
        const countEl = document.getElementById('category-detail-count');
        const countDescEl = document.getElementById('category-detail-count-desc');
        const actionTitleEl = document.getElementById('category-detail-action-title');
        const actionDescEl = document.getElementById('category-detail-action-desc');
        const actionBtn = document.getElementById('category-detail-action');
        const secondaryBtn = document.getElementById('category-detail-secondary');

        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (countEl) countEl.textContent = data.count;
        if (countDescEl) countDescEl.textContent = data.countDesc;
        if (actionTitleEl) actionTitleEl.textContent = data.actionTitle;
        if (actionDescEl) actionDescEl.textContent = data.actionDesc;
        if (actionBtn) actionBtn.textContent = data.action;
        if (secondaryBtn) secondaryBtn.textContent = filterKey === 'all' ? 'Focar avisos' : 'Ver tudo';
    }

    filterItems.forEach((item) => {
        item.addEventListener('click', () => applyFilter(item.dataset.filter || 'all'));
    });

    document.getElementById('category-detail-action')?.addEventListener('click', () => {
        const activeFilter = document.querySelector('.filter-item.active[data-filter]')?.dataset.filter || 'all';
        applyFilter(activeFilter);
    });

    document.getElementById('category-detail-secondary')?.addEventListener('click', () => {
        applyFilter('all');
    });

    // Initial filter
    applyFilter('all');
    
    // Re-initialize Lucide icons if any were added dynamically (though here they are static)
    if (window.lucide) window.lucide.createIcons();
}
