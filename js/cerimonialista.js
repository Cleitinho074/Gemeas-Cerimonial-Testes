/* ==========================================================================
   CERIMONIALISTA.JS
   Protótipo do painel da cerimonialista: lista todos os eventos que ela
   atende (de contas de clientes diferentes) e permite abrir a lista de
   convidados de cada um, em modo somente leitura — quem edita continua
   sendo a noiva, no painel.html dela.

   EVENTS é um dado de exemplo. Na versão real viria de uma tabela de
   relação N:N entre cerimonialista e conta (uma cerimonialista atende
   várias contas; uma conta pode ter mais de uma cerimonialista vinculada).
   ========================================================================== */

const STATUS_LABEL = {
  confirmado: "Confirmado",
  recusado: "Recusado",
  pendente: "Pendente",
  aprovacao: "Aguardando aprovação",
};

const EVENTS = [
  {
    id: "ana-marcos",
    tipo: "Casamento",
    titulo: "Ana & Marcos",
    conta: "Conta: Ana Beatriz Ferreira",
    data: "2026-12-12",
    dataLabel: "12 de dezembro de 2026",
    guests: [
      { nome: "Fernanda Alves", telefone: "(11) 98888-1122", status: "confirmado", lugares: 2, restricao: "—", criancas: 0, respondido: "12/08/2026" },
      { nome: "Rodrigo Souza", telefone: "(11) 97777-3344", status: "confirmado", lugares: 1, restricao: "Vegetariano", criancas: 0, respondido: "10/08/2026" },
      { nome: "Camila e Bruno", telefone: "(11) 96666-5566", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Marta Ribeiro", telefone: "(11) 95555-7788", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "14/08/2026" },
      { nome: "Larissa Gomes (não encontrada)", telefone: "(11) 92222-4321", status: "aprovacao", lugares: 1, restricao: "—", criancas: 0, respondido: "15/08/2026" },
    ],
  },
  {
    id: "beatriz-debutante",
    tipo: "Debutante / 15 anos",
    titulo: "Debutante da Beatriz",
    conta: "Conta: Fernanda Lima",
    data: "2026-10-20",
    dataLabel: "20 de outubro de 2026",
    guests: [
      { nome: "Sofia Martins", telefone: "(11) 99876-1122", status: "confirmado", lugares: 1, restricao: "—", criancas: 0, respondido: "01/09/2026" },
      { nome: "Gabriel Torres", telefone: "(11) 99765-3344", status: "confirmado", lugares: 1, restricao: "—", criancas: 0, respondido: "30/08/2026" },
      { nome: "Isabela e família", telefone: "(11) 99654-5566", status: "pendente", lugares: 0, restricao: "—", criancas: 2, respondido: "—" },
      { nome: "Thiago Almeida", telefone: "(11) 99543-7788", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "28/08/2026" },
    ],
  },
  {
    id: "otavio-aniversario",
    tipo: "Aniversário",
    titulo: "50 anos do Sr. Otávio",
    conta: "Conta: Renata Otávio",
    data: "2026-11-05",
    dataLabel: "5 de novembro de 2026",
    guests: [
      { nome: "Carla Otávio", telefone: "(11) 98432-1122", status: "confirmado", lugares: 2, restricao: "Sem lactose", criancas: 0, respondido: "20/08/2026" },
      { nome: "Marcelo Duarte", telefone: "(11) 98321-3344", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
      { nome: "Patrícia Nunes", telefone: "(11) 98210-5566", status: "confirmado", lugares: 1, restricao: "—", criancas: 0, respondido: "22/08/2026" },
      { nome: "José Ricardo (não encontrado)", telefone: "(11) 98109-7788", status: "aprovacao", lugares: 2, restricao: "—", criancas: 1, respondido: "24/08/2026" },
    ],
  },
];

let currentEventId = null;
let currentDetailStatusFilter = "todos";

/** Calcula quantos dias faltam a partir de hoje (ou se já passou). */
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = target - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function countByStatus(guests, status) {
  return guests.filter((g) => g.status === status).length;
}

/** Desenha os cards de evento, ordenados do mais próximo pro mais distante, com filtro de busca. */
function renderEventList() {
  const search = document.getElementById("eventSearch").value.trim().toLowerCase();
  const grid = document.getElementById("eventGrid");

  const sorted = [...EVENTS].sort((a, b) => daysUntil(a.data) - daysUntil(b.data));
  const filtered = sorted.filter(
    (ev) =>
      !search ||
      ev.titulo.toLowerCase().includes(search) ||
      ev.conta.toLowerCase().includes(search) ||
      ev.tipo.toLowerCase().includes(search)
  );

  grid.innerHTML = "";

  filtered.forEach((ev) => {
    const dias = daysUntil(ev.data);
    let badgeClass = "";
    let badgeText = `faltam ${dias} dias`;
    if (dias < 0) {
      badgeClass = "past";
      badgeText = "evento já passou";
    } else if (dias <= 30) {
      badgeClass = "soon";
    } else if (dias === 0) {
      badgeText = "é hoje!";
    }

    const card = document.createElement("div");
    card.className = "event-card" + (ev.id === currentEventId ? " selected" : "");
    card.innerHTML = `
      <div class="tipo">${ev.tipo}</div>
      <div class="titulo">${ev.titulo}</div>
      <div class="conta">${ev.conta}</div>
      <span class="days-badge ${badgeClass}">${badgeText}</span>
      <div class="mini-stats">
        <div class="mini-stat confirmado"><strong>${countByStatus(ev.guests, "confirmado")}</strong>confirmados</div>
        <div class="mini-stat recusado"><strong>${countByStatus(ev.guests, "recusado")}</strong>recusados</div>
        <div class="mini-stat"><strong>${countByStatus(ev.guests, "pendente")}</strong>pendentes</div>
        <div class="mini-stat aprovacao"><strong>${countByStatus(ev.guests, "aprovacao")}</strong>aprovação</div>
      </div>
    `;
    card.addEventListener("click", () => openEventDetail(ev.id));
    grid.appendChild(card);
  });
}

/** Abre a visão somente-leitura da lista de convidados de um evento específico. */
function openEventDetail(eventId) {
  currentEventId = eventId;
  currentDetailStatusFilter = "todos";
  renderEventList();

  const ev = EVENTS.find((e) => e.id === eventId);
  document.getElementById("detailTitle").textContent = `${ev.tipo} · ${ev.titulo}`;
  document.getElementById("detailSub").textContent = `${ev.conta} · ${ev.dataLabel}`;

  document.getElementById("eventListSection").classList.remove("show");
  document.getElementById("eventListSection").style.display = "none";
  document.getElementById("detailPanel").classList.add("show");

  document.querySelectorAll(".detail-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.status === "todos"));
  renderDetailTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeEventDetail() {
  currentEventId = null;
  document.getElementById("eventListSection").style.display = "block";
  document.getElementById("detailPanel").classList.remove("show");
  renderEventList();
}

function setDetailStatusFilter(status) {
  currentDetailStatusFilter = status;
  document.querySelectorAll(".detail-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.status === status));
  renderDetailTable();
}

/** Redesenha a tabela de convidados do evento aberto, sem nenhuma ação de edição. */
function renderDetailTable() {
  const ev = EVENTS.find((e) => e.id === currentEventId);
  if (!ev) return;

  const search = document.getElementById("detailSearch").value.trim().toLowerCase();
  const tbody = document.getElementById("detailTableBody");
  const emptyState = document.getElementById("detailEmptyState");

  const filtered = ev.guests.filter((g) => {
    const matchesStatus = currentDetailStatusFilter === "todos" || g.status === currentDetailStatusFilter;
    const matchesSearch = !search || g.nome.toLowerCase().includes(search) || g.telefone.includes(search);
    return matchesStatus && matchesSearch;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  filtered.forEach((g) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div class="guest-name">${g.nome}</div>
        <div class="guest-sub">${g.telefone}</div>
      </td>
      <td><span class="badge ${g.status}">${STATUS_LABEL[g.status]}</span></td>
      <td>${g.lugares || "—"}</td>
      <td>${g.restricao}</td>
      <td>${g.criancas > 0 ? g.criancas : "—"}</td>
      <td>${g.respondido}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderEventList();

  document.getElementById("eventSearch").addEventListener("input", renderEventList);
  document.getElementById("detailSearch").addEventListener("input", renderDetailTable);
  document.getElementById("backToList").addEventListener("click", closeEventDetail);

  document.querySelectorAll(".detail-chip").forEach((chip) => {
    chip.addEventListener("click", () => setDetailStatusFilter(chip.dataset.status));
  });
});
