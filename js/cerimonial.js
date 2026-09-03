/* ==========================================================================
   CERIMONIAL.JS
   Lógica do protótipo do painel da cerimonialista.

   MODELO DE DADOS (o que essas variáveis representam no banco real)

     cerimonialista        → quem está logada aqui (CERIMONIALISTA)
     conta                 → a conta do cliente, dona do evento (evento.conta)
     evento                → casamento / 15 anos / aniversário (EVENTOS)
     convidado             → lista de presença de cada evento (evento.convidados)

     cerimonialista_conta  → tabela de RELAÇÃO N:N que ainda não existe no
                             sistema. É ela que responde "quais contas essa
                             cerimonialista atende?".

                             cerimonialista_conta
                             ├── id
                             ├── cerimonialista_id  → FK cerimonialista
                             ├── conta_id           → FK conta
                             ├── papel              → 'cerimonialista' | 'assistente'
                             ├── vinculado_em       → data do vínculo
                             └── status             → 'ativo' | 'encerrado'

     Uma cerimonialista atende várias contas; uma conta pode ter mais de uma
     cerimonialista vinculada (a titular e uma assistente, por exemplo).
     Os eventos vêm por tabela (conta 1:N evento, que é a RN06 já existente),
     então a cerimonialista enxerga: cerimonialista → contas → eventos →
     convidados. Neste protótipo esse caminho já está montado em memória: o
     array EVENTOS é o resultado final dessa consulta.

     Permissão: o vínculo dá leitura, não escrita. Editar convidados, dados do
     evento e enviar convites continua sendo exclusivo da conta da noiva.
   ========================================================================== */

/* --- Quem está logada (viria da sessão) ----------------------------------- */
const CERIMONIALISTA = {
  nome: "Patrícia Duarte",
  empresa: "Duarte Cerimonial",
  iniciais: "PD",
};

/* --- Eventos que ela atende (viria de cerimonialista_conta → evento) ------ */
const EVENTOS = [
  {
    id: "ana-marcos",
    titulo: "Ana & Marcos",
    tipo: "casamento",
    data: "2026-12-12",
    local: "Sítio das Palmeiras",
    papel: "cerimonialista",
    conta: { id: 101, nome: "Ana Beatriz Ferreira", relacao: "Noiva" },
    convidados: [
      { nome: "Fernanda Alves", telefone: "(11) 98888-1122", grupo: "Família da noiva", status: "confirmado", lugares: 2, restricao: "—", criancas: 0, respondido: "12/08/2026" },
      { nome: "Rodrigo Souza", telefone: "(11) 97777-3344", grupo: "Trabalho", status: "confirmado", lugares: 1, restricao: "Vegetariano", criancas: 0, respondido: "10/08/2026" },
      { nome: "Camila e Bruno", telefone: "(11) 96666-5566", grupo: "Faculdade", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Marta Ribeiro", telefone: "(11) 95555-7788", grupo: "Família do noivo", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "14/08/2026" },
      { nome: "Juliana Prima", telefone: "(11) 94444-9900", grupo: "Família da noiva", status: "confirmado", lugares: 3, restricao: "Sem lactose", criancas: 1, respondido: "09/08/2026" },
      { nome: "Diego Martins", telefone: "(11) 93333-1234", grupo: "Trabalho", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Larissa Gomes", telefone: "(11) 92222-4321", grupo: "—", status: "aprovacao", lugares: 1, restricao: "—", criancas: 0, respondido: "15/08/2026" },
      { nome: "Paulo e Renata", telefone: "(11) 91111-8765", grupo: "Faculdade", status: "confirmado", lugares: 2, restricao: "—", criancas: 0, respondido: "08/08/2026" },
      { nome: "Beatriz Nunes", telefone: "(11) 90000-2468", grupo: "Família do noivo", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Carlos Eduardo", telefone: "(11) 98765-1357", grupo: "Trabalho", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "11/08/2026" },
      { nome: "Tia Sônia", telefone: "(11) 98701-2233", grupo: "Família da noiva", status: "confirmado", lugares: 2, restricao: "Diabética", criancas: 0, respondido: "13/08/2026" },
      { nome: "Vinícius Prado", telefone: "(11) 98812-4455", grupo: "Trabalho", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
    ],
  },
  {
    id: "isadora-15",
    titulo: "Isadora Nogueira",
    tipo: "debutante",
    data: "2026-10-03",
    local: "Buffet Villa Reale",
    papel: "cerimonialista",
    conta: { id: 102, nome: "Cláudia Nogueira", relacao: "Mãe da debutante" },
    convidados: [
      { nome: "Turma do 2º ano B", telefone: "(67) 99101-2233", grupo: "Escola", status: "confirmado", lugares: 6, restricao: "—", criancas: 0, respondido: "20/08/2026" },
      { nome: "Vovó Neusa", telefone: "(67) 99202-3344", grupo: "Família", status: "confirmado", lugares: 2, restricao: "Sem sal", criancas: 0, respondido: "18/08/2026" },
      { nome: "Helena Braga", telefone: "(67) 99303-4455", grupo: "Escola", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Padrinho Wesley", telefone: "(67) 99404-5566", grupo: "Família", status: "confirmado", lugares: 4, restricao: "—", criancas: 2, respondido: "19/08/2026" },
      { nome: "Prof. Tatiane", telefone: "(67) 99505-6677", grupo: "Escola", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "21/08/2026" },
      { nome: "Amanda Vilela", telefone: "(67) 99606-7788", grupo: "Dança", status: "confirmado", lugares: 1, restricao: "Vegetariana", criancas: 0, respondido: "22/08/2026" },
      { nome: "Grupo da valsa", telefone: "(67) 99707-8899", grupo: "Dança", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Tio Fabinho", telefone: "(67) 99808-9900", grupo: "Família", status: "aprovacao", lugares: 3, restricao: "—", criancas: 1, respondido: "24/08/2026" },
      { nome: "Sabrina Correia", telefone: "(67) 99909-1011", grupo: "Escola", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Família Bittencourt", telefone: "(67) 99110-1213", grupo: "Família", status: "confirmado", lugares: 5, restricao: "—", criancas: 2, respondido: "17/08/2026" },
    ],
  },
  {
    id: "elcio-60",
    titulo: "60 anos do Seu Élcio",
    tipo: "aniversario",
    data: "2027-02-21",
    local: "Chácara Recanto Verde",
    papel: "assistente",
    conta: { id: 103, nome: "Rafael Duarte", relacao: "Filho do aniversariante" },
    convidados: [
      { nome: "Compadre Zé Maria", telefone: "(67) 98120-3311", grupo: "Amigos", status: "confirmado", lugares: 2, restricao: "—", criancas: 0, respondido: "25/08/2026" },
      { nome: "Dona Cida", telefone: "(67) 98230-4422", grupo: "Vizinhos", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Time da pelada", telefone: "(67) 98340-5533", grupo: "Amigos", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Irmã Lourdes", telefone: "(67) 98450-6644", grupo: "Família", status: "confirmado", lugares: 3, restricao: "Sem glúten", criancas: 1, respondido: "23/08/2026" },
      { nome: "Seu Alcides", telefone: "(67) 98560-7755", grupo: "Vizinhos", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "26/08/2026" },
      { nome: "Pessoal da firma", telefone: "(67) 98670-8866", grupo: "Trabalho", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Netos do Élcio", telefone: "(67) 98780-9977", grupo: "Família", status: "confirmado", lugares: 4, restricao: "—", criancas: 3, respondido: "22/08/2026" },
      { nome: "Márcio Tavares", telefone: "(67) 98890-1088", grupo: "Trabalho", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
    ],
  },
];

const STATUS_LABEL = {
  confirmado: "Confirmado",
  recusado: "Recusado",
  pendente: "Pendente",
  aprovacao: "Aguardando aprovação",
};

const TIPO_LABEL = {
  casamento: "Casamento",
  debutante: "15 anos",
  aniversario: "Aniversário",
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/* --- Estado da tela ------------------------------------------------------- */
let eventoAberto = null;      // null = tela de listagem
let filtroTipo = "todos";
let ordenacao = "data";
let filtroStatus = "todos";   // dentro do painel de um evento

/* ==========================================================================
   Helpers de data e contagem
   ========================================================================== */

function hojeZerado() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Dias que faltam até o evento (negativo = já aconteceu). */
function diasAte(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const evento = new Date(ano, mes - 1, dia);
  return Math.round((evento - hojeZerado()) / 86400000);
}

function dataPorExtenso(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

/** Texto curto de urgência usado no card. */
function textoContagem(dias) {
  if (dias < 0) return "já aconteceu";
  if (dias === 0) return "é hoje";
  if (dias === 1) return "é amanhã";
  return `faltam ${dias} dias`;
}

/** Conta convidados por status + soma de lugares confirmados. */
function contar(evento) {
  const por = (s) => evento.convidados.filter((c) => c.status === s).length;
  return {
    total: evento.convidados.length,
    confirmado: por("confirmado"),
    recusado: por("recusado"),
    pendente: por("pendente"),
    aprovacao: por("aprovacao"),
    lugares: evento.convidados
      .filter((c) => c.status === "confirmado")
      .reduce((soma, c) => soma + c.lugares, 0),
  };
}

/* ==========================================================================
   Tela 1 — listagem de eventos
   ========================================================================== */

/** Resumo somado de todos os eventos, no topo da listagem. */
function renderResumo() {
  const soma = EVENTOS.reduce(
    (acc, ev) => {
      const c = contar(ev);
      acc.pendente += c.pendente;
      acc.aprovacao += c.aprovacao;
      acc.confirmado += c.confirmado;
      return acc;
    },
    { pendente: 0, aprovacao: 0, confirmado: 0 }
  );

  const contas = new Set(EVENTOS.map((ev) => ev.conta.id)).size;
  const proximo = [...EVENTOS].sort((a, b) => diasAte(a.data) - diasAte(b.data))[0];

  document.getElementById("resumoEventos").textContent = EVENTOS.length;
  document.getElementById("resumoContas").textContent = contas;
  document.getElementById("resumoConfirmados").textContent = soma.confirmado;
  document.getElementById("resumoPendentes").textContent = soma.pendente;
  document.getElementById("resumoAprovacao").textContent = soma.aprovacao;
  document.getElementById("resumoProximo").textContent = `${proximo.titulo} · ${textoContagem(diasAte(proximo.data))}`;
}

/** Aplica busca, filtro de tipo e ordenação, e desenha os cards. */
function renderEventos() {
  const busca = document.getElementById("buscaEvento").value.trim().toLowerCase();
  const grid = document.getElementById("eventGrid");
  const vazio = document.getElementById("eventEmpty");

  let lista = EVENTOS.filter((ev) => {
    const casaTipo = filtroTipo === "todos" || ev.tipo === filtroTipo;
    const casaBusca =
      !busca ||
      ev.titulo.toLowerCase().includes(busca) ||
      ev.conta.nome.toLowerCase().includes(busca) ||
      ev.local.toLowerCase().includes(busca);
    return casaTipo && casaBusca;
  });

  if (ordenacao === "pendentes") {
    lista.sort((a, b) => contar(b).pendente - contar(a).pendente);
  } else {
    // padrão: data do evento mais próxima primeiro
    lista.sort((a, b) => diasAte(a.data) - diasAte(b.data));
  }

  grid.innerHTML = "";
  vazio.style.display = lista.length === 0 ? "block" : "none";

  lista.forEach((ev) => {
    const c = contar(ev);
    const dias = diasAte(ev.data);
    const respondidos = c.confirmado + c.recusado + c.aprovacao;
    const progresso = Math.round((respondidos / c.total) * 100);
    const urgente = dias >= 0 && dias <= 45;

    const card = document.createElement("article");
    card.className = "event-card" + (urgente ? " urgente" : "");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver confirmações de ${ev.titulo}`);
    card.innerHTML = `
      <div class="event-top">
        <span class="mono">${TIPO_LABEL[ev.tipo]}</span>
        <span class="countdown${urgente ? " perto" : ""}">${textoContagem(dias)}</span>
      </div>

      <h3>${ev.titulo}</h3>
      <p class="event-when">${dataPorExtenso(ev.data)} · ${ev.local}</p>

      <div class="progress" aria-hidden="true"><span style="width:${progresso}%"></span></div>
      <p class="progress-label">${respondidos} de ${c.total} convites respondidos · ${c.lugares} lugares confirmados</p>

      <div class="count-row">
        <span class="count confirmado"><b>${c.confirmado}</b> confirmados</span>
        <span class="count recusado"><b>${c.recusado}</b> recusados</span>
        <span class="count pendente"><b>${c.pendente}</b> pendentes</span>
        <span class="count aprovacao"><b>${c.aprovacao}</b> aguardando aprovação</span>
      </div>

      <div class="event-foot">
        <span class="conta">
          Conta de <strong>${ev.conta.nome}</strong>
          <span class="conta-sub">${ev.conta.relacao} · você entra como ${ev.papel}</span>
        </span>
        <span class="open-link">Ver confirmações →</span>
      </div>
    `;
    card.addEventListener("click", () => abrirEvento(ev.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirEvento(ev.id);
      }
    });
    grid.appendChild(card);
  });
}

/* ==========================================================================
   Tela 2 — confirmações de um evento (somente leitura)
   ========================================================================== */

function abrirEvento(id) {
  window.location.hash = `evento=${id}`;
}

function voltarParaLista() {
  window.location.hash = "";
}

/** Preenche o select de grupos com os grupos do evento aberto. */
function popularGrupos(evento) {
  const select = document.getElementById("grupoFiltro");
  select.innerHTML = '<option value="todos">Todos os grupos</option>';
  [...new Set(evento.convidados.map((c) => c.grupo).filter((g) => g !== "—"))].forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    select.appendChild(opt);
  });
}

function renderDetalhe() {
  const ev = eventoAberto;
  const c = contar(ev);
  const dias = diasAte(ev.data);

  document.getElementById("detalheTitulo").textContent = ev.titulo;
  document.getElementById("detalheSub").textContent =
    `${TIPO_LABEL[ev.tipo]} · ${dataPorExtenso(ev.data)} · ${ev.local} · ${textoContagem(dias)}`;
  document.getElementById("detalheConta").innerHTML =
    `Lista mantida por <strong>${ev.conta.nome}</strong> (${ev.conta.relacao})`;

  document.getElementById("statTotal").textContent = c.total;
  document.getElementById("statConfirmado").textContent = c.confirmado;
  document.getElementById("statRecusado").textContent = c.recusado;
  document.getElementById("statPendente").textContent = c.pendente;
  document.getElementById("statAprovacao").textContent = c.aprovacao;
  document.getElementById("statLugares").textContent = c.lugares;

  renderTabela();
}

function renderTabela() {
  const busca = document.getElementById("buscaConvidado").value.trim().toLowerCase();
  const grupo = document.getElementById("grupoFiltro").value;
  const tbody = document.getElementById("guestTableBody");
  const vazio = document.getElementById("guestEmpty");

  const lista = eventoAberto.convidados.filter((g) => {
    const casaStatus = filtroStatus === "todos" || g.status === filtroStatus;
    const casaBusca = !busca || g.nome.toLowerCase().includes(busca) || g.telefone.includes(busca);
    const casaGrupo = grupo === "todos" || g.grupo === grupo;
    return casaStatus && casaBusca && casaGrupo;
  });

  tbody.innerHTML = "";
  vazio.style.display = lista.length === 0 ? "block" : "none";

  lista.forEach((g) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="guest-name">${g.nome}</div>
        <div class="guest-sub">${g.telefone}</div>
      </td>
      <td>${g.grupo}</td>
      <td><span class="badge ${g.status}">${STATUS_LABEL[g.status]}</span></td>
      <td>${g.lugares || "—"}</td>
      <td>${g.restricao}</td>
      <td>${g.criancas > 0 ? g.criancas : "—"}</td>
      <td>${g.respondido}</td>
    `;
    tbody.appendChild(tr);
  });
}

function setStatusFiltro(status) {
  filtroStatus = status;
  document.querySelectorAll(".stat-card[data-filter]").forEach((card) => {
    card.classList.toggle("active", card.dataset.filter === status);
  });
  renderTabela();
}

/* ==========================================================================
   Navegação entre as duas telas (pelo hash, pra o botão voltar funcionar)
   ========================================================================== */

function aplicarRota() {
  const match = window.location.hash.match(/evento=([\w-]+)/);
  const evento = match ? EVENTOS.find((ev) => ev.id === match[1]) : null;

  const telaLista = document.getElementById("telaLista");
  const telaDetalhe = document.getElementById("telaDetalhe");

  if (evento) {
    eventoAberto = evento;
    telaLista.style.display = "none";
    telaDetalhe.style.display = "block";
    document.getElementById("crumbEvento").textContent = evento.titulo;
    document.getElementById("buscaConvidado").value = "";
    popularGrupos(evento);
    setStatusFiltro("todos");
    renderDetalhe();
  } else {
    eventoAberto = null;
    telaDetalhe.style.display = "none";
    telaLista.style.display = "block";
    renderResumo();
    renderEventos();
  }
  window.scrollTo({ top: 0 });
}

document.addEventListener("DOMContentLoaded", () => {
  // Tela de listagem
  document.getElementById("buscaEvento").addEventListener("input", renderEventos);

  document.getElementById("ordenacao").addEventListener("change", (e) => {
    ordenacao = e.target.value;
    renderEventos();
  });

  document.querySelectorAll(".tipo-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filtroTipo = chip.dataset.tipo;
      document.querySelectorAll(".tipo-chip").forEach((c) => c.classList.toggle("active", c === chip));
      renderEventos();
    });
  });

  document.getElementById("limparEventos").addEventListener("click", () => {
    document.getElementById("buscaEvento").value = "";
    document.getElementById("ordenacao").value = "data";
    ordenacao = "data";
    filtroTipo = "todos";
    document.querySelectorAll(".tipo-chip").forEach((c) => c.classList.toggle("active", c.dataset.tipo === "todos"));
    renderEventos();
  });

  // Tela de detalhe
  document.getElementById("voltarLista").addEventListener("click", (e) => {
    e.preventDefault();
    voltarParaLista();
  });

  document.getElementById("buscaConvidado").addEventListener("input", renderTabela);
  document.getElementById("grupoFiltro").addEventListener("change", renderTabela);

  document.querySelectorAll(".stat-card[data-filter]").forEach((card) => {
    card.addEventListener("click", () => setStatusFiltro(card.dataset.filter));
  });

  document.getElementById("btnNaoRespondeu").addEventListener("click", () => setStatusFiltro("pendente"));

  document.getElementById("btnLimparConvidados").addEventListener("click", () => {
    document.getElementById("buscaConvidado").value = "";
    document.getElementById("grupoFiltro").value = "todos";
    setStatusFiltro("todos");
  });

  window.addEventListener("hashchange", aplicarRota);
  aplicarRota();
});
