const REASONS = {
  active:    ['Pagamento confirmado','Conta validada', 'Plano vigente com acesso liberado'],
  inactive:  ['Período de espera','Plano expirado sem renovação','Outros'],
  locked:    ['Pedido de pausa','Suspensão temporária','Outros'],
  cancelled: ['Cancelamento definitivo solicitado pelo aluno','Compra estornada','Conta Suspeita']
};

const ACCESS = {
  active:    [{ok:true,t:'Acesso completo aos cursos'},{ok:true, t:'Ferramentas da plataforma'},{ok:true, t:'Histórico de compras'},{ok:true, t:'Certificados disponíveis'}],
  inactive:  [{ok:false,t:'Cursos bloqueados'},{ok:true,t:'Ferramentas da plataforma'},{ok:true,t:'Histórico de compras'},{ok:true,t:'Certificados disponíveis'}],
  locked:    [{ok:false,t:'Cursos bloqueados'},{ok:true,t:'Ferramentas da plataforma'},{ok:true,t:'Histórico de compras'},{ok:true,t:'Certificados disponíveis'}],
  cancelled: [{ok:false,t:'Cursos bloqueados'},{ok:false,t:'Ferramentas bloqueadas'},{ok:false,t:'Sem acesso ao Toga Mege'},{ok:false,t:'Sem acesso a certificados'}],
};

const SL = {active:'Ativo',inactive:'Inativo',locked:'Trancado',cancelled:'Cancelado'};
const DOT_CLR = {active:'#38a05a',inactive:'#aaa',locked:'#c89828',cancelled:'#d94040',accent:'#4f7c5a'};

const students = [
  {id:1, name:'DENNY DOS SANTOS BASTOS',       cpf:'00483882704', email:'dsbastos.bastos@gmail.com',    phone:'21999389400',  bday:'15/08/1979', status:'active'},
  {id:2, name:'ERIK ARIEL SIMPLICIO',          cpf:'06275188936', email:'erik_sbs@hotmail.com',         phone:'47999345660',  bday:'03/07/1989', status:'active'},
  {id:3, name:'EVANDRO DIOGO',                 cpf:'21516321804', email:'evandro.diogo@gmail.com',      phone:'11939514995',  bday:'30/06/1982', status:'active'},
  {id:4, name:'FABRICIO AMARAL RAMIRES',       cpf:'02772135411', email:'fab.ramires@uol.com.br',       phone:'82996277215',  bday:'13/11/1979', status:'inactive', reason:'Cadastro incompleto'},
  {id:5, name:'THIAGO ANDRADE FARIAS',         cpf:'01411000806', email:'andradeilha@hotmail.com',      phone:'51997568237',  bday:'17/07/1987', status:'locked',   reason:'Pedido de pausa'},
  {id:6, name:'FABIANA RATHKE NUNES',          cpf:'01411000806', email:'fabianarathke@gmail.com',      phone:'51997568237',  bday:'17/07/1987', status:'active'},
  {id:7, name:'SANTIAGO ARTUR BERGER SITO',    cpf:'01411000806', email:'artursito@gmail.com',          phone:'51997568237',  bday:'17/07/1987', status:'active'},
  {id:8, name:'FERNANDO AZEVEDO DE ALMEIDA',   cpf:'72112000144', email:'fernando.azevedo@tjmt.jus.br', phone:'65981121247',  bday:'18/11/1981', status:'cancelled',reason:'Solicitação de cancelamento'},
  {id:9, name:'FERNANDA DE FARIA ALVES',       cpf:'04871632652', email:'ffalves16@gmail.com',          phone:'37991560383',  bday:'16/03/1982', status:'active'},
  {id:10,name:'ANDRÉ LUIS MENDES DOS REIS',    cpf:'34397533873', email:'fandrelmdreis@gmail.com',      phone:'12996344720',  bday:'17/04/1982', status:'active'},
];

let fStatus = 'all', fSearch = '', editId = null, picked = null;

function render() {
  const q = fSearch.toLowerCase();
  const rows = students.filter(s => {
    if (fStatus !== 'all' && s.status !== fStatus) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.cpf.includes(q) && !s.email.toLowerCase().includes(q)) return false;
    return true;
  });

  document.getElementById('countLabel').textContent = `${rows.length} aluno${rows.length !== 1 ? 's' : ''}`;

  if (!rows.length) {
    document.getElementById('tbody').innerHTML =
      `<tr><td colspan="7" style="text-align:center;padding:40px;color:#bbb">Nenhum aluno encontrado.</td></tr>`;
    return;
  }

  document.getElementById('tbody').innerHTML = rows.map((s, i) => {
    const canToggle = s.status === 'active' || s.status === 'inactive';
    const togHtml = canToggle
      ? `<label class="toggle-label" title="${s.status==='active'?'Inativar':'Ativar'}">
           <input type="checkbox" ${s.status==='active'?'checked':''} onchange="quickToggle(${s.id},this.checked)">
           <div class="toggle-slider"></div>
         </label>`
      : '';

    return `
    <tr data-status="${s.status}" style="animation:rowIn .2s both;animation-delay:${i*.03}s">
      <td class="name-cell">${s.name}</td>
      <td class="cpf-cell">${s.cpf}</td>
      <td class="email-cell">${s.email}</td>
      <td class="phone-cell hide-md">${s.phone}</td>
      <td class="birthday-cell hide-md">${s.bday}</td>
      <td>
        <span class="badge badge-${s.status}">
          <span class="badge-dot"></span>${SL[s.status]}
        </span>
        ${s.reason ? `<div style="font-size:11px;color:#bbb;margin-top:3px">${s.reason}</div>` : ''}
      </td>
      <td>
        <div class="action-wrap">
          ${togHtml}
          <button class="actions-btn" onclick="openModal(${s.id})">
            Ações
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="color:#aaa">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function setFilter(val, btn) {
  fStatus = val;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.toggle('active', b===btn));
  render();
}
function applyFilters() {
  fSearch = document.querySelector('.search-input').value;
  render();
}
function quickToggle(id, checked) {
  const s = students.find(x=>x.id===id);
  s.status = checked ? 'active' : 'inactive';
  s.reason = checked ? '' : 'Inativado manualmente';
  render();
  toast(`${s.name} → ${SL[s.status]}`, s.status);
}

function openModal(id) {
  editId = id; picked = null;
  const s = students.find(x=>x.id===id);
  document.getElementById('mName').textContent = s.name;
  document.getElementById('mMeta').textContent = `CPF: ${s.cpf} · Status atual: ${SL[s.status]}`;
  document.querySelectorAll('.status-opt').forEach(el => el.classList.remove('sel'));
  document.getElementById('accessBox').style.display = 'none';
  document.getElementById('reasonSel').innerHTML = '<option value="">Selecione o motivo…</option>';
  document.getElementById('reasonNote').value = '';
  document.getElementById('overlay').classList.add('open');
}
function closeModal() { document.getElementById('overlay').classList.remove('open'); editId=null; picked=null; }
function outsideClose(e) { if(e.target===document.getElementById('overlay')) closeModal(); }

function pickStatus(val) {
  picked = val;
  document.querySelectorAll('.status-opt').forEach(el => el.classList.toggle('sel', el.dataset.v===val));
  const sel = document.getElementById('reasonSel');
  sel.innerHTML = '<option value="">Selecione o motivo…</option>' +
    (REASONS[val]||[]).map(r=>`<option>${r}</option>`).join('');
  const box = document.getElementById('accessBox');
  box.style.display = 'block';
  document.getElementById('accessRows').innerHTML = (ACCESS[val]||[]).map(a=>`
    <div class="access-row">
      <div class="aico ${a.ok?'aico-yes':'aico-no'}">
        ${a.ok
          ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
          : `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18M6 6l12 12"/></svg>`}
      </div>
      ${a.t}
    </div>`).join('');
}

function saveModal() {
  if (!picked) { toast('Selecione um novo status', 'locked'); return; }
  const reason = document.getElementById('reasonSel').value || document.getElementById('reasonNote').value.trim();
  if (!reason && picked !== 'active') { toast('Informe o motivo da alteração', 'locked'); return; }
  const s = students.find(x=>x.id===editId);
  s.status = picked; s.reason = reason;
  closeModal(); render();
  toast(`${s.name} → ${SL[picked]}`, picked);
}

function toast(msg, type='accent') {
  const el = document.getElementById('toast');
  document.getElementById('tDot').style.background = DOT_CLR[type]||DOT_CLR.accent;
  document.getElementById('tMsg').textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 3000);
}

const s2 = document.createElement('style');
s2.textContent = `@keyframes rowIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}`;
document.head.appendChild(s2);
render();