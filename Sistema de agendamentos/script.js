/**
 * Agenda Pro — Frontend Script
 * Comunicação com a API FastAPI via fetch
 */

const API = "";  // deixe vazio para usar o mesmo origin (FastAPI serve o frontend)
// Se rodar o frontend separado (ex: Live Server), use: const API = "http://localhost:8000";

// ── Estado global ──────────────────────────────────────────────────────────
let servicos = [];
let agendamentos = [];
let pendingDeleteId = null;

// ── Utilitários ───────────────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function formatarData(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function nomeMes(dateStr) {
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const m = parseInt(dateStr.split("-")[1]) - 1;
  return meses[m] ?? "";
}

function diaMes(dateStr) {
  return dateStr.split("-")[2] ?? "";
}

function mostrarBanner(tipo, msg, link = null) {
  const banner = $("status-banner");
  const iconEl = $("banner-icon");
  const msgEl = $("banner-msg");
  const linkEl = $("banner-link");

  // Remove classes anteriores
  banner.className = `banner banner--${tipo}`;
  iconEl.textContent = tipo === "success" ? "✓" : tipo === "error" ? "✕" : "ℹ";
  msgEl.textContent = msg;

  if (link) {
    linkEl.href = link;
    linkEl.hidden = false;
  } else {
    linkEl.hidden = true;
  }

  banner.hidden = false;
  banner.scrollIntoView({ behavior: "smooth", block: "nearest" });

  if (tipo === "success") {
    setTimeout(() => { banner.hidden = true; }, 6000);
  }
}

function setLoading(btn, loading) {
  const textEl = btn.querySelector(".btn__text");
  const loaderEl = btn.querySelector(".btn__loader");
  if (loading) {
    textEl.hidden = true;
    loaderEl.hidden = false;
    btn.disabled = true;
  } else {
    textEl.hidden = false;
    loaderEl.hidden = true;
    btn.disabled = false;
  }
}

function limparErros() {
  ["nome", "servico", "data", "hora"].forEach(f => {
    const el = $(`err-${f}`);
    if (el) el.textContent = "";
    const input = $(f);
    if (input) input.classList.remove("is-invalid");
  });
}

function marcarErro(campo, msg) {
  const err = $(`err-${campo}`);
  const input = $(campo);
  if (err) err.textContent = msg;
  if (input) input.classList.add("is-invalid");
}

// ── Tabs ──────────────────────────────────────────────────────────────────

function ativarTab(tab) {
  document.querySelectorAll(".nav__tab").forEach(btn => {
    btn.classList.toggle("nav__tab--active", btn.dataset.tab === tab);
  });
  $("tab-agendar").hidden = tab !== "agendar";
  $("tab-agenda").hidden = tab !== "agenda";

  if (tab === "agenda") carregarAgendamentos();
}

document.querySelectorAll(".nav__tab").forEach(btn => {
  btn.addEventListener("click", () => ativarTab(btn.dataset.tab));
});

// ── Horários disponíveis ──────────────────────────────────────────────────

function gerarHorarios() {
  const select = $("hora");
  select.innerHTML = '<option value="">Selecione o horário abaixo</option>';
  const inicio = 8 * 60;   // 08:00
  const fim = 19 * 60;  // 18:00
  for (let m = inicio; m < fim; m += 30) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    const opt = document.createElement("option");
    opt.value = `${hh}:${mm}`;
    opt.textContent = `${hh}:${mm}`;
    select.appendChild(opt);
  }
}

// ── Carregar serviços ─────────────────────────────────────────────────────

async function carregarServicos() {
  try {
    const res = await fetch(`${API}/servicos`);
    servicos = await res.json();
    const sel = $("servico");
    sel.innerHTML = '<option value="">Selecione um serviço abaixo</option>';
    servicos.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.nome;
      opt.textContent = s.nome;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error("Erro ao carregar serviços:", e);
  }
}

// Mostrar duração ao selecionar serviço
$("servico").addEventListener("change", () => {
  const selecionado = servicos.find(s => s.nome === $("servico").value);
  const hint = $("hint-duracao");
  if (selecionado) {
    const h = Math.floor(selecionado.duracao_minutos / 60);
    const m = selecionado.duracao_minutos % 60;
    const dur = h > 0
      ? `${h}h${m > 0 ? ` ${m}min` : ""}`
      : `${m}min`;
    hint.textContent = `⏱ Duração: ${dur}`;
  } else {
    hint.textContent = "";
  }
});

// ── Data mínima = hoje ────────────────────────────────────────────────────

function setDataMinima() {
  const hoje = new Date().toISOString().split("T")[0];
  $("data").min = hoje;
  $("data").value = hoje;
}

// ── Formulário: Agendar ───────────────────────────────────────────────────

$("form-agendar").addEventListener("submit", async (e) => {
  e.preventDefault();
  limparErros();
  $("status-banner").hidden = true;

  const nome = $("nome").value.trim();
  const tel = $("telefone").value.trim();
  const servico = $("servico").value;
  const data = $("data").value;
  const hora = $("hora").value;

  let valido = true;

  if (!nome) {
    marcarErro("nome", "Informe o nome do cliente.");
    valido = false;
  }
  if (!servico) {
    marcarErro("servico", "Selecione um serviço.");
    valido = false;
  }
  if (!data) {
    marcarErro("data", "Selecione uma data.");
    valido = false;
  }
  if (!hora) {
    marcarErro("hora", "Selecione um horário.");
    valido = false;
  }

  if (!valido) return;

  const btn = $("btn-agendar");
  setLoading(btn, true);

  try {
    const res = await fetch(`${API}/agendar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, telefone: tel || null, servico, data, hora }),
    });

    const data_resp = await res.json();

    if (res.ok) {
      const gcLink = data_resp.google_integrado ? data_resp.google_event_link : null;
      mostrarBanner(
        "success",
        `✓ Agendamento confirmado para ${formatarData(data)} às ${hora}!`,
        gcLink
      );
      $("form-agendar").reset();
      setDataMinima();
      $("hint-duracao").textContent = "";
    } else {
      const msg = data_resp.detail ?? "Erro desconhecido.";
      mostrarBanner("error", msg);
    }

  } catch (err) {
    mostrarBanner("error", "Falha de conexão com o servidor. Verifique se o backend está rodando.");
    console.error(err);
  } finally {
    setLoading(btn, false);
  }
});

// ── Carregar agendamentos ─────────────────────────────────────────────────

async function carregarAgendamentos() {
  $("skeleton").hidden = false;
  $("empty-state").hidden = true;
  $("lista-agendamentos").innerHTML = "";

  try {
    const res = await fetch(`${API}/agendamentos`);
    agendamentos = await res.json();
    $("skeleton").hidden = true;
    renderAgendamentos(agendamentos);
  } catch (e) {
    $("skeleton").hidden = true;
    $("empty-state").hidden = false;
    $("empty-state").querySelector(".empty-state__title").textContent =
      "Erro ao carregar agendamentos.";
    $("empty-state").querySelector(".empty-state__sub").textContent =
      "Verifique se o backend está rodando em localhost:8000";
    console.error(e);
  }
}

function renderAgendamentos(lista) {
  const container = $("lista-agendamentos");
  container.innerHTML = "";

  if (!lista.length) {
    $("empty-state").hidden = false;
    return;
  }
  $("empty-state").hidden = true;

  lista.forEach((ag, i) => {
    const card = document.createElement("div");
    card.className = "ag-card";
    card.style.animationDelay = `${i * 50}ms`;

    const tel = ag.telefone
      ? `<span class="ag-card__phone">📞 ${ag.telefone}</span>`
      : "";

    const gcBtn = ag.google_event_link
      ? `<a class="ag-card__link" href="${ag.google_event_link}" target="_blank" title="Ver no Google Calendar">📅</a>`
      : "";

    card.innerHTML = `
      <div class="ag-card__date">
        <div class="ag-card__date-day">${diaMes(ag.data)}</div>
        <div class="ag-card__date-mon">${nomeMes(ag.data)}</div>
      </div>
      <div class="ag-card__info">
        <div class="ag-card__nome">${escHtml(ag.nome)}</div>
        <div class="ag-card__meta">
          <span class="ag-card__servico">${escHtml(ag.servico)}</span>
          <span class="ag-card__hora">⏰ ${ag.hora}</span>
          ${tel}
        </div>
      </div>
      <div class="ag-card__actions">
        ${gcBtn}
        <button class="ag-card__del" data-id="${ag.id}" title="Cancelar agendamento">✕</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Eventos de cancelar
  container.querySelectorAll(".ag-card__del").forEach(btn => {
    btn.addEventListener("click", () => abrirModal(Number(btn.dataset.id)));
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Busca/filtro ─────────────────────────────────────────────────────────

$("search-input").addEventListener("input", () => {
  const q = $("search-input").value.toLowerCase();
  const filtrado = agendamentos.filter(ag =>
    ag.nome.toLowerCase().includes(q) ||
    ag.servico.toLowerCase().includes(q)
  );
  renderAgendamentos(filtrado);
});

$("btn-refresh").addEventListener("click", carregarAgendamentos);

// ── Modal de confirmação ──────────────────────────────────────────────────

function abrirModal(id) {
  pendingDeleteId = id;
  const ag = agendamentos.find(a => a.id === id);
  if (ag) {
    $("modal-body").textContent =
      `Cancelar o agendamento de "${ag.nome}" em ${formatarData(ag.data)} às ${ag.hora}?`;
  }
  $("modal-backdrop").hidden = false;
}

function fecharModal() {
  $("modal-backdrop").hidden = true;
  pendingDeleteId = null;
}

$("modal-cancel").addEventListener("click", fecharModal);
$("modal-backdrop").addEventListener("click", (e) => {
  if (e.target === $("modal-backdrop")) fecharModal();
});

$("modal-confirm").addEventListener("click", async () => {
  if (!pendingDeleteId) return;

  const btn = $("modal-confirm");
  btn.textContent = "Cancelando...";
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/agendamento/${pendingDeleteId}`, { method: "DELETE" });
    if (res.ok) {
      fecharModal();
      carregarAgendamentos();
    } else {
      const data = await res.json();
      alert(data.detail ?? "Erro ao cancelar.");
    }
  } catch (e) {
    alert("Falha de conexão.");
    console.error(e);
  } finally {
    btn.textContent = "Sim, cancelar";
    btn.disabled = false;
  }
});

// ── Init ──────────────────────────────────────────────────────────────────

(async function init() {
  setDataMinima();
  gerarHorarios();
  await carregarServicos();
})();
