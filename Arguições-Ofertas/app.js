// ─── DATA ───
const professors = [
  {
    id: 'arnaldo',
    name: 'Prof(a). Arnaldo Bruno',
    subject: 'Direito Constitucional',
    color: '#1a3a6e',
    avatar: 'AB',
    meetLink: 'https://meet.google.com/arnaldo-mege-const',
    available: [8,9,10,14,15]
  },
  {
    id: 'fernando',
    name: 'Prof(a). Fernando Abreu',
    subject: 'Direito Civil',
    color: '#1a3a6e',
    avatar: 'FA',
    meetLink: 'https://meet.google.com/fernando-mege-civil',
    available: [9,10,11,13,16]
  },
  {
    id: 'renata',
    name: 'Prof(a). Renata Souza',
    subject: 'Direito Penal',
    color: '#1a3a6e',
    avatar: 'RS',
    meetLink: 'https://meet.google.com/renata-mege-penal',
    available: [8,10,11,15,16]
  },
  {
    id: 'marcelo',
    name: 'Prof(a). Marcelo Lima',
    subject: 'Direito Processual',
    color: '#1a3a6e',
    avatar: 'ML',
    meetLink: 'https://meet.google.com/marcelo-mege-proc',
    available: [9,11,13,14,16]
  }
];

// Days with availability in March 2026 (simulated)
const availableDays = [3,4,5,9,10,11,12,16,17,18,19,23,24,25,26];
const bookedSlots = {}; // key: "day-hour-profId"

let state = {
  year: 2026,
  month: 2, // 0-based, 2 = March
  selectedDay: null,
  selectedTime: null,
  selectedProf: null,
  randomMode: false
};

const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// ─── CALENDAR ───
function renderCalendar() {
  const { year, month } = state;
  document.getElementById('cal-month').textContent = `${months[month]} ${year}`;
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  weekDays.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-header';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    const dow = (firstDay + d - 1) % 7;
    const isWeekend = dow === 0 || dow === 6;
    const hasSlots = availableDays.includes(d) && !isWeekend;

    el.className = 'cal-day' + (isWeekend ? ' unavailable' : '') + (hasSlots ? ' has-slots' : '');
    if (state.selectedDay === d) el.classList.add('selected');
    el.textContent = d;

    if (hasSlots) {
      el.onclick = () => selectDay(d);
    }
    grid.appendChild(el);
  }
}

function selectDay(day) {
  state.selectedDay = day;
  state.selectedTime = null;
  renderCalendar();
  renderSlots();
  updateConfirm();
}

function prevMonth() {
  state.month--;
  if (state.month < 0) { state.month = 11; state.year--; }
  state.selectedDay = null;
  state.selectedTime = null;
  renderCalendar();
  document.getElementById('slots-label').style.display = 'none';
  document.getElementById('slots-grid').style.display = 'none';
}

function nextMonth() {
  state.month++;
  if (state.month > 11) { state.month = 0; state.year++; }
  state.selectedDay = null;
  state.selectedTime = null;
  renderCalendar();
  document.getElementById('slots-label').style.display = 'none';
  document.getElementById('slots-grid').style.display = 'none';
}

// ─── SLOTS ───
function getAvailableSlots() {
  if (!state.selectedDay) return [];
  const allHours = new Set();
  professors.forEach(p => p.available.forEach(h => allHours.add(h)));
  return [...allHours].sort((a,b) => a-b);
}

function renderSlots() {
  const label = document.getElementById('slots-label');
  const grid = document.getElementById('slots-grid');

  if (!state.selectedDay) {
    label.style.display = 'none';
    grid.style.display = 'none';
    return;
  }

  label.style.display = 'block';
  grid.style.display = 'grid';
  grid.innerHTML = '';

  const hours = getAvailableSlots();
  hours.forEach(h => {
    const el = document.createElement('div');
    el.className = 'time-slot';

    const profsAtHour = professors.filter(p => p.available.includes(h));
    const isFree = profsAtHour.length > 0;

    el.innerHTML = `
      <div class="time">${String(h).padStart(2,'0')}:00</div>
      ${state.randomMode ? '' : `<div class="prof">${profsAtHour.map(p=>p.name.split(' ')[0]).join(', ')}</div>`}
      <div class="slot-status ${isFree ? 'free' : 'busy'}">${isFree ? '● Livre' : '✕ Ocupado'}</div>
    `;

    if (!isFree) {
      el.classList.add('booked');
    } else {
      if (state.selectedTime === h) el.classList.add('selected');
      el.onclick = () => selectTime(h);
    }
    grid.appendChild(el);
  });
}

function selectTime(h) {
  state.selectedTime = h;
  if (state.randomMode) {
    const profsAtHour = professors.filter(p => p.available.includes(h));
    state.selectedProf = profsAtHour[Math.floor(Math.random() * profsAtHour.length)];
  }
  renderSlots();
  updateConfirm();
  renderProfCards();
}

// ─── PROF CARDS ───
function renderProfCards() {
  const container = document.getElementById('prof-cards');
  container.innerHTML = '';

  const profsToShow = state.selectedTime
    ? professors.filter(p => p.available.includes(state.selectedTime))
    : professors;

  profsToShow.forEach(p => {
    const el = document.createElement('div');
    el.className = 'prof-card' + (state.selectedProf?.id === p.id ? ' selected' : '');
    el.innerHTML = `
      <div class="prof-avatar" style="background:${p.color}">${p.avatar}</div>
      <h4>${p.name}</h4>
      <p>${p.subject}</p>
      <div class="meet-link"><i class="fa-solid fa-video"></i> Link exclusivo disponível</div>
    `;
    el.onclick = () => selectProf(p);
    container.appendChild(el);
  });
}

function selectProf(p) {
  if (state.randomMode) return;
  state.selectedProf = p;
  renderProfCards();
  updateConfirm();
}

// ─── MODE TOGGLE ───
function toggleMode() {
  state.randomMode = document.getElementById('random-mode').checked;
  const profSection = document.getElementById('prof-section');
  profSection.style.opacity = state.randomMode ? '.5' : '1';
  profSection.style.pointerEvents = state.randomMode ? 'none' : 'all';

  if (state.randomMode && state.selectedTime) {
    const profsAtHour = professors.filter(p => p.available.includes(state.selectedTime));
    state.selectedProf = profsAtHour[Math.floor(Math.random() * profsAtHour.length)];
    updateConfirm();
  } else {
    state.selectedProf = null;
    updateConfirm();
  }
  renderSlots();
}

// ─── CONFIRM ───
function updateConfirm() {
  const { selectedDay, selectedTime, selectedProf, year, month } = state;

  document.getElementById('conf-date').textContent = selectedDay
    ? `${String(selectedDay).padStart(2,'0')} de ${months[month]} de ${year}` : '—';
  document.getElementById('conf-time').textContent = selectedTime
    ? `${String(selectedTime).padStart(2,'0')}:00` : '—';
  document.getElementById('conf-prof').textContent = selectedProf ? selectedProf.name : '—';

  const linkRow = document.getElementById('conf-link-row');
  if (selectedProf) {
    linkRow.style.display = 'flex';
    document.getElementById('conf-link').textContent = selectedProf.meetLink;
    document.getElementById('success-link').textContent = selectedProf.meetLink;
  } else {
    linkRow.style.display = 'none';
  }

  const btn = document.getElementById('confirm-btn');
  btn.disabled = !(selectedDay && selectedTime && selectedProf);

  if (selectedDay) markStep(2, 'done');
  if (selectedProf) markStep(3, 'done');
  if (selectedDay && selectedTime && selectedProf) markStep(4, 'active');
}

function markStep(n, cls) {
  const el = document.getElementById('step'+n);
  el.className = 'step ' + cls;
  if (cls === 'done') el.querySelector('.step-num').textContent = '✓';
  if (n > 1) document.getElementById('div'+(n-1)).classList.add('done');
}

// ─── CONFIRM ACTION ───
function confirmScheduling() {
  const { selectedDay, selectedTime, selectedProf, year, month } = state;
  if (!selectedDay || !selectedTime || !selectedProf) return;

  appointments.unshift({
    id: Date.now(),
    day: selectedDay,
    month: months[month],
    time: `${String(selectedTime).padStart(2,'0')}:00`,
    prof: selectedProf.name,
    subject: selectedProf.subject,
    link: selectedProf.meetLink,
    status: 'confirmed'
  });

  document.getElementById('scheduling-form').style.display = 'none';
  document.getElementById('success-screen').classList.add('show', 'fade-in');
}

function resetScheduling() {
  state.selectedDay = null;
  state.selectedTime = null;
  state.selectedProf = null;
  document.getElementById('success-screen').classList.remove('show');
  document.getElementById('scheduling-form').style.display = 'block';
  renderCalendar();
  document.getElementById('slots-label').style.display = 'none';
  document.getElementById('slots-grid').style.display = 'none';
  renderProfCards();
  updateConfirm();
  [2,3,4].forEach(n => {
    const el = document.getElementById('step'+n);
    el.className = 'step';
    el.querySelector('.step-num').textContent = n;
  });
  [1,2,3].forEach(n => document.getElementById('div'+n).classList.remove('done'));
  document.getElementById('step1').className = 'step done';
  document.getElementById('step2').className = 'step active';
}

function copyLink() {
  const link = document.getElementById('conf-link').textContent || document.getElementById('success-link').textContent;
  navigator.clipboard.writeText(link).catch(() => {});
  const btns = document.querySelectorAll('.copy-btn');
  btns.forEach(b => { b.textContent = 'Copiado!'; setTimeout(() => b.textContent = 'Copiar', 1500); });
}

// ─── MY APPOINTMENTS ───
const appointments = [
  {
    id: 1,
    day: 10,
    month: 'Março',
    time: '09:00',
    prof: 'Prof(a). Arnaldo Bruno',
    subject: 'Direito Constitucional',
    link: 'https://meet.google.com/arnaldo-mege-const',
    status: 'confirmed'
  },
];

function renderAppointments() {
  const container = document.getElementById('appt-list');
  if (!appointments.length) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:40px;">Nenhum agendamento encontrado.</p>';
    return;
  }
  container.innerHTML = '';
  appointments.forEach(a => {
    const statusLabel = { confirmed: '✔ Confirmado', pending: '⏳ Aguardando', cancelled: '✕ Cancelado' };
    const el = document.createElement('div');
    el.className = 'appt-card fade-in';
    el.innerHTML = `
      <div class="appt-date-box">
        <div class="day">${String(a.day).padStart(2,'0')}</div>
        <div class="month">${a.month}</div>
      </div>
      <div class="appt-info">
        <h4>Prova Oral — ${a.subject}</h4>
        <p> <i class="fa-solid fa-clock"></i> ${a.time} &nbsp;|&nbsp; <i class="fa-solid fa-user"></i> ${a.prof}</p>
        <p <i class="fa-solid fa-link"></i> <a href="${a.link}" style="color:var(--accent); font-weight:700; font-size:11px;">${a.link}</a></p>
      </div>
      <div class="appt-actions">
        <span class="status-badge ${a.status}">${statusLabel[a.status]}</span>
        ${a.status !== 'cancelled' ? `<button class="btn btn-sm btn-outline" onclick="cancelAppt(${a.id})">Cancelar</button>` : ''}
      </div>
    `;
    container.appendChild(el);
  });
}

function cancelAppt(id) {
  const a = appointments.find(x => x.id === id);
  if (a) a.status = 'cancelled';
  renderAppointments();
}

// ─── TABS ───
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  if (tab === 'meus') renderAppointments();
}

function setActive(el) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

// ─── INIT ───
renderCalendar();
renderProfCards();
updateConfirm();
