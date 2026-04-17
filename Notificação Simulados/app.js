/* ===========================
   DATA
=========================== */
const INITIAL_RECADOS = [
  {
    id: 1,
    title: "SOS HOJE AS 19HRS",
    date: "24/02/2026",
    time: "17:37",
    pinned: true,
    type: "normal",
    content:
      "(CLUBE DA MAGISTRATURA + ENAM 2026.1)Prezados alunos relembrando a todos que hoje teremos o nosso SOS às 19hrs.\n\nℹ Informações do Encontro:\nData: 24/02 (Terça-feira)\nHorário: 19h\nLink de Acesso: https://meet.google.com/kun-ioxk-rdu",
  },
  {
    id: 2,
    title: "Atualizações e Erratas – Dezembro de 2025",
    date: "16/12/2025",
    time: "17:28",
    pinned: true,
    type: "normal",
    content:
      "ENAM 2026 - DIREITO CONSTITUCIONAL\nCIRCUITO LEGISLATIVO - ART. 44-58\nPÁGINA 89\n\nOnde se lê:\nSTF: O foro por prerrogativa de função aplica-se apenas aos crimes cometidos durante o exercício do cargo e relacionados às funções desempenhadas. STF. Plenário. AP 937 QO/RJ, Rel. Min. Roberto Barroso, julgado em 03/05/2018 (Info 900).\n\nLeia-se:\nEm 2018, o STF fixou uma tese sobre o foro por prerrogativa de função, que se dividia em duas partes:\n1) O foro por prerrogativa de função aplica-se apenas aos crimes cometidos durante o exercício do cargo e relacionados às funções desempenhadas.\n2) Após o final da instrução processual, com a publicação do despacho de intimação para apresentação de alegações finais, a competência para processar e julgar ações penais não será mais afetada em razão de o agente público vir a ocupar outro cargo ou deixar o cargo que ocupava, qualquer que seja o motivo.\n\nEm 2025, o STF decidiu alterar parcialmente o entendimento acima fixado.\nO item 1 ainda está valendo. O item 2 foi superado.\nO que vale atualmente é o seguinte: a prerrogativa de foro para julgamento de crimes praticados no cargo e em razão das funções subsiste mesmo após o afastamento do cargo, ainda que o inquérito ou a ação penal sejam iniciados depois de cessado seu exercício.\n\nEntendimento fixado em 2018:\nA autoridade (ex: Presidente da República, Senador, Deputado Federal etc.) cometeu um crime funcional durante o exercício do cargo; logo, a competência para julgar o delito é do STF; no entanto, se essa autoridade deixasse o cargo antes do fim da instrução processual, o STF deixava de ser competente para julgá-la.\n\nEntendimento alterado em 2025 (atual):\nA autoridade (ex: Presidente da República, Senador, Deputado Federal etc.) cometeu um crime funcional durante o exercício do cargo; logo, a competência para julgar o delito é do STF; mesmo que essa autoridade deixe o cargo a competência para julgá-la continua sendo do STF.\nSTF. Plenário. HC 232.627/DF, Rel. Min. Gilmar Mendes, julgado em 12/03/2025 (Info 1168).",
  },
];

/*
 * Simulados que o backend já liberou para esta turma.
 * Em produção, esta lista viria de uma chamada de API
 * (ex: GET /api/turmas/:id/simulados?status=liberado).
 * Cada simulado é entregue ao aluno assim que é liberado.
 */
const SIMULADOS_LIBERADOS = [
  {
    id: "s1",
    nome: "Simulado Nacional ENAM 2026 – Direito Constitucional",
    prazo: "10/03/2026",
    duracao: "4h",
    questoes: 50,
    liberadoEm: { date: "06/03/2026", time: "09:15" },
    /* delay (ms) para simular a chegada em tempo real na demonstração */
    _demoDelay: 5000,
  },
  {
    id: "s2",
    nome: "Simulado Temático – Direito Civil",
    prazo: "15/03/2026",
    duracao: "3h",
    questoes: 40,
    liberadoEm: { date: "06/03/2026", time: "09:16" },
    _demoDelay: 5000,
  },
];

/* ===========================
   STATE
=========================== */
let recados        = [...INITIAL_RECADOS];
let expandedCards  = {};
let notifCount     = 0;
let notifPanelOpen = false;
let simuladosOpen  = false;
let faseOpen       = false;
let activeNav      = "mural";

/* ===========================
   UTILS
=========================== */
function nowStr() {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 5000);
}

/* ===========================
   ICON HELPERS (Font Awesome)
=========================== */
const SVG = {
  /* Ícone de pin com cor dinâmica */
  pin: (c) => `<i class="fa-solid fa-thumbtack" style="color:${c}; font-size:13px;"></i>`,

  /* Ícones inline usados nos recados */
  chat:      `<i class="fa-solid fa-comment"></i>`,
  calendar:  `<i class="fa-solid fa-calendar-days"></i>`,
  clock:     `<i class="fa-solid fa-clock"></i>`,

  /* Chevrons do submenu */
  chevDown:  `<i class="fa-solid fa-chevron-down"></i>`,
  chevRight: `<i class="fa-solid fa-chevron-right"></i>`,

  /* Ícones da sidebar — mesmos do prova_oral.html */
  home:      `<i class="fa-solid fa-house"></i>`,
  mural:     `<i class="fa-solid fa-comments"></i>`,
  professor: `<i class="fa-solid fa-microchip"></i>`,
  banco:     `<i class="fa-solid fa-comment"></i>`,
  materials: `<i class="fa-solid fa-copy"></i>`,
  video:     `<i class="fa-solid fa-video"></i>`,
  caderno:   `<i class="fa-solid fa-book"></i>`,
  megecast:  `<i class="fa-solid fa-podcast"></i>`,
  simulados: `<i class="fas fa-file-lines"></i>`,
  fase:      `<i class="fa-solid fa-file-pen"></i>`,
  support:   `<i class="fa-solid fa-phone"></i>`,
};

/* ===========================
   RENDER: SIDEBAR
=========================== */
function renderSidebar() {
  const navItems = [
    { id: "home",        label: "Home",               icon: SVG.home },
    { id: "mural",       label: "Mural de recados",   icon: SVG.mural },
    { id: "professores", label: "Professores IA",     icon: SVG.professor, badge: "BETA" },
    { id: "banco",       label: "Banco de questões",  icon: SVG.banco,     badge: "BETA" },
    { id: "materiais",   label: "Materiais",          icon: SVG.materials },
    { id: "videoaulas",  label: "Videoaulas",         icon: SVG.video },
    { id: "caderno",     label: "Caderno de Erros",   icon: SVG.caderno },
    { id: "megecast",    label: "Megecast",           icon: SVG.megecast },
    { id: "simulados",   label: "Simulados",          icon: SVG.simulados, hasChildren: true },
    { id: "fase2",       label: "2a fase/Prova Oral", icon: SVG.fase,      hasChildren: true },
    { id: "suporte",     label: "Suporte ao aluno",   icon: SVG.support },
  ];

  const nav = document.getElementById("nav");
  nav.innerHTML = navItems.map((item) => {
    const isActive = activeNav === item.id;
    const badge    = item.badge ? `<span class="badge">${item.badge}</span>` : "";
    const isOpen   = item.id === "simulados" ? simuladosOpen : faseOpen;
    const chevron  = item.hasChildren
      ? `<span class="nav-chevron">${isOpen ? SVG.chevDown : SVG.chevRight}</span>`
      : "";

    let submenu = "";
    if (item.id === "simulados") {
      submenu = `
        <div class="nav-submenu ${simuladosOpen ? "open" : ""}">
          <button class="nav-subitem">▸ Respondidos</button>
        </div>`;
    }
    if (item.id === "fase2") {
      submenu = `
        <div class="nav-submenu ${faseOpen ? "open" : ""}">
          <button class="nav-subitem">▸ Redação</button>
          <button class="nav-subitem">▸ Oral</button>
        </div>`;
    }

    return `
      <div>
        <button class="nav-item ${isActive ? "active" : ""}" data-id="${item.id}">
          <div class="nav-item-inner">
            <span class="nav-item-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${badge}
          </div>
          ${chevron}
        </button>
        ${submenu}
      </div>`;
  }).join("");

  nav.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (id === "simulados") { simuladosOpen = !simuladosOpen; renderSidebar(); return; }
      if (id === "fase2")     { faseOpen = !faseOpen;           renderSidebar(); return; }
      activeNav = id;
      renderSidebar();
    });
  });
}

/* ===========================
   RENDER: NOTIFICATION PANEL
=========================== */
function renderNotifPanel() {
  const btn   = document.getElementById("btn-notif");
  const badge = document.getElementById("notif-badge");
  const panel = document.getElementById("notif-panel");

  btn.className = "btn-notif" + (notifCount > 0 ? " has-notif" : "");

  if (notifCount > 0) {
    badge.textContent = notifCount;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }

  panel.className = "notif-panel" + (notifPanelOpen ? " open" : "");

  const simRecados = recados.filter((r) => r.type === "simulado");
  panel.querySelector(".notif-list").innerHTML = simRecados.length === 0
    ? `<p class="notif-empty">Nenhuma notificação de simulado.</p>`
    : simRecados.map((r) => `
        <div class="notif-item">
          <div class="notif-item-title">${r.title}</div>
          <div class="notif-item-date">${r.date} às ${r.time}</div>
        </div>`).join("");
}

/* ===========================
   RENDER: RECADOS LIST
=========================== */
function renderRecados() {
  const list = document.getElementById("recados-list");
  list.innerHTML = recados.map((recado, idx) => {
    const isSimulado     = recado.type === "simulado";
    const isExpanded     = expandedCards[recado.id] !== false;
    const lines          = recado.content.split("\n");
    const preview        = lines.slice(0, 3).join("\n");
    const hasMore        = lines.length > 3;
    const displayContent = isExpanded ? recado.content : preview;

    const simuladoBox = isSimulado && recado.simuladoData ? `
      <div class="simulado-info-box">
        <div class="simulado-info-item">📅 <strong>Prazo:</strong> ${recado.simuladoData.prazo}</div>
        <div class="simulado-info-item">⏱ <strong>Duração:</strong> ${recado.simuladoData.duracao}</div>
        <div class="simulado-info-item">📝 <strong>Questões:</strong> ${recado.simuladoData.questoes}</div>
        <div><button class="btn-acessar">Acessar Simulado →</button></div>
      </div>` : "";

    const tagNovo     = recado._novo  ? `<span class="tag-novo">NOVO</span>` : "";
    const tagSimulado = isSimulado    ? `<span class="tag-simulado">SIMULADO</span>` : "";
    const pinIcon     = recado.pinned ? SVG.pin("#e53e3e") : "";
    const pinSim      = isSimulado    ? SVG.pin("#3182ce") : "";
    const verMaisBtn  = hasMore
      ? `<button class="btn-ver-mais" data-id="${recado.id}">${isExpanded ? "▲ Ver menos" : "▼ Ver mais"}</button>`
      : "";

    return `
      <div class="recado-item ${isSimulado ? "simulado" : ""} ${recado._novo ? "novo" : ""}"
           style="border-bottom:${idx < recados.length - 1 ? "1px solid #e2e8f0" : "none"};">
        <div class="recado-header">
          <div class="recado-header-left">
            <span class="recado-chat-icon ${isSimulado ? "simulado" : ""}">${SVG.chat}</span>
            <span class="recado-title ${isSimulado ? "simulado" : ""}">${recado.title}</span>
            ${tagNovo}${tagSimulado}
          </div>
          <div class="recado-header-right">
            <div class="recado-date">${SVG.calendar}<span>${recado.date}</span></div>
            <div class="recado-time">${SVG.clock}<span>${recado.time}</span></div>
            ${pinIcon}${pinSim}
          </div>
        </div>
        <div class="recado-body">
          ${simuladoBox}
          <pre class="recado-content">${displayContent}</pre>
          ${verMaisBtn}
        </div>
      </div>`;
  }).join("");

  list.querySelectorAll(".btn-ver-mais").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      expandedCards[id] = !expandedCards[id];
      renderRecados();
    });
  });
}

/* ===========================
   RECEBER NOTIFICAÇÃO AUTOMÁTICA
   Chamado pelo sistema assim que o backend informa
   que um simulado foi liberado para a turma.
   Em produção: disparado por WebSocket ou polling.
=========================== */
function receberSimuladoLiberado(sim) {
  const { date, time } = sim.liberadoEm || nowStr();

  const novoRecado = {
    id:           Date.now() + Math.random(),
    title:        `🚨 NOVO SIMULADO DISPONÍVEL — ${sim.nome}`,
    date,
    time,
    pinned:       false,
    type:         "simulado",
    _novo:        true,
    simuladoData: { nome: sim.nome, prazo: sim.prazo, duracao: sim.duracao, questoes: sim.questoes },
    content:
      `Um novo simulado foi liberado para a sua turma!\n\n` +
      `📋 Simulado: ${sim.nome}\n` +
      `📅 Prazo para realização: ${sim.prazo}\n` +
      `⏱ Duração: ${sim.duracao}\n` +
      `📝 Total de questões: ${sim.questoes}\n\n` +
      `Acesse agora em Simulados e não perca o prazo! Boa sorte a todos! 🍀`,
  };

  recados    = [novoRecado, ...recados];
  notifCount = notifCount + 1;
  expandedCards[novoRecado.id] = true;

  renderRecados();
  renderNotifPanel();
  showToast(`📋 Novo simulado disponível: ${sim.nome}`);

  /* Remove destaque "NOVO" após 6 segundos */
  setTimeout(() => {
    recados = recados.map((r) =>
      r.id === novoRecado.id ? { ...r, _novo: false } : r
    );
    renderRecados();
  }, 6000);
}

/* ===========================
   INICIALIZAÇÃO AUTOMÁTICA DAS NOTIFICAÇÕES
   Percorre SIMULADOS_LIBERADOS e agenda cada um
   com seu delay, reproduzindo a chegada em tempo real.
   Em produção, substituir por listener de WebSocket
   ou chamada periódica à API.
=========================== */
function agendarNotificacoesAutomaticas() {
  SIMULADOS_LIBERADOS.forEach((sim) => {
    setTimeout(() => receberSimuladoLiberado(sim), sim._demoDelay);
  });
}

/* ===========================
   INIT
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  renderSidebar();
  renderRecados();
  renderNotifPanel();

  /* Dispara as notificações automaticamente */
  agendarNotificacoesAutomaticas();

  /* Bell toggle */
  document.getElementById("btn-notif").addEventListener("click", () => {
    notifPanelOpen = !notifPanelOpen;
    renderNotifPanel();
  });

  /* Fecha painel ao clicar fora */
  document.addEventListener("click", (e) => {
    const wrapper = document.querySelector(".notif-wrapper");
    if (notifPanelOpen && wrapper && !wrapper.contains(e.target)) {
      notifPanelOpen = false;
      renderNotifPanel();
    }
  });
});
