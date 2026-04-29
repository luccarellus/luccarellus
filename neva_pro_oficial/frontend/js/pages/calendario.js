import { showToast } from '../core/utils.js';

const STORAGE_KEY = 'neva_calendar_events_v1';

function loadEvents() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function monthLabel(date) {
    return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function eventTypeStyle(type) {
    const styles = {
        simulado: { className: 'event-simulado', color: '#ef4444' },
        revisao: { className: 'event-revisao', color: '#f59e0b' },
        redacao: { className: 'event-redacao', color: '#10b981' },
        mentoria: { className: 'event-mentoria', color: '#8b5cf6' },
    };
    return styles[type] || styles.revisao;
}

function createEventCard(event) {
    const date = new Date(event.date);
    // Correcting for timezone offset to show the date picked by user
    const dateLocal = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const typeStyle = eventTypeStyle(event.type);
    
    return `
        <div class="event-item">
            <div class="event-date" style="background: ${typeStyle.color}18; color: ${typeStyle.color};">
                <span class="day">${String(dateLocal.getDate()).padStart(2, '0')}</span>
                <span class="month">${monthLabel(dateLocal).replace('.', '')}</span>
            </div>
            <div class="event-info">
                <h4>${event.title}</h4>
                <p><i data-lucide="clock" style="width: 12px; vertical-align: middle;"></i> ${event.time || '18:00'}${event.note ? ` · ${event.note}` : ''}</p>
            </div>
        </div>
    `;
}

export function initCalendario() {
    console.log('Initializing Calendario page...');
    
    const eventModal = document.getElementById('event-modal');
    const btnNewEvent = document.getElementById('btn-new-event');
    const btnCloseEvent = document.getElementById('close-event-modal');
    const btnCancelEvent = document.getElementById('cancel-event');
    const eventForm = document.getElementById('event-form');
    const upcomingEventsList = document.getElementById('upcoming-events-list');

    function openEventModal() {
        eventModal.classList.add('active');
        eventModal.setAttribute('aria-hidden', 'false');
        document.getElementById('event-title').focus();
    }

    function closeEventModal() {
        eventModal.classList.remove('active');
        eventModal.setAttribute('aria-hidden', 'true');
        eventForm.reset();
        const timeInput = document.getElementById('event-time');
        if (timeInput) timeInput.value = '18:00';
    }

    function renderSavedEvents() {
        const savedEvents = loadEvents().sort((a, b) => new Date(a.date) - new Date(b.date));
        if (!upcomingEventsList) return;

        // Keep static items if any (but typically we'd want to merge or just use dynamic)
        // Original code merged them. Let's stick to that for now but clean up.
        const staticEvents = [
            { day: '22', month: 'Abr', title: 'Simulado Global ENEM', time: '13:00 - 18:30', type: 'simulado' },
            { day: '25', month: 'Abr', title: 'Mentoria Estratégica', time: 'Meet Online', type: 'mentoria' },
            { day: '29', month: 'Abr', title: 'Entrega de Redação', time: 'Eixo Temático: Social', type: 'redacao' }
        ];

        let html = savedEvents.map(createEventCard).join('');
        
        // Add static ones if they don't exist in saved (simplified)
        // For now, let's just render saved + hardcoded placeholders as in original
        upcomingEventsList.innerHTML = html + `
            <div class="event-item">
                <div class="event-date">
                    <span class="day">22</span>
                    <span class="month">Abr</span>
                </div>
                <div class="event-info">
                    <h4>Simulado Global ENEM</h4>
                    <p><i data-lucide="clock" style="width: 12px; vertical-align: middle;"></i> 13:00 - 18:30</p>
                </div>
            </div>
            <div class="event-item">
                <div class="event-date" style="background: rgba(139, 92, 246, 0.10); border-color: rgba(139, 92, 246, 0.18);">
                    <span class="day">25</span>
                    <span class="month">Abr</span>
                </div>
                <div class="event-info">
                    <h4>Mentoria Estratégica</h4>
                    <p><i data-lucide="video" style="width: 12px; vertical-align: middle;"></i> Meet Online</p>
                </div>
            </div>
            <div class="event-item">
                <div class="event-date">
                    <span class="day">29</span>
                    <span class="month">Abr</span>
                </div>
                <div class="event-info">
                    <h4>Entrega de Redação</h4>
                    <p><i data-lucide="file-text" style="width: 12px; vertical-align: middle;"></i> Eixo Temático: Social</p>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    btnNewEvent?.addEventListener('click', openEventModal);
    btnCloseEvent?.addEventListener('click', closeEventModal);
    btnCancelEvent?.addEventListener('click', closeEventModal);
    eventModal?.addEventListener('click', (e) => {
        if (e.target === eventModal) closeEventModal();
    });

    eventForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('event-title').value.trim();
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const type = document.getElementById('event-type').value;
        const note = document.getElementById('event-note').value.trim();

        if (!title) {
            showToast('Por favor, insira um título para o evento.', 'warning');
            return;
        }

        const events = loadEvents();
        events.unshift({
            id: `evt-${Date.now()}`,
            title,
            date,
            time,
            type,
            note,
        });
        saveEvents(events);
        renderSavedEvents();
        closeEventModal();
        showToast('Evento salvo com sucesso!', 'success');
    });

    renderSavedEvents();
}
