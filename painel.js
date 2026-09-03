/* ==========================================================================
   PAINEL.JS
   Lógica do protótipo do painel do organizador.
   Os dados em GUESTS são de exemplo — na versão com conta e banco de dados
   real, essa lista viria da tabela "convidado" em vez de estar fixa aqui.
   ========================================================================== */

const GUESTS = [
  { nome: "Fernanda Alves", telefone: "(11) 98888-1122", grupo: "Família da noiva", status: "confirmado", lugares: 2, restricao: "—", criancas: 0, respondido: "12/08/2026" },
  { nome: "Rodrigo Souza", telefone: "(11) 97777-3344", grupo: "Trabalho", status: "confirmado", lugares: 1, restricao: "Vegetariano", criancas: 0, respondido: "10/08/2026" },
  { nome: "Camila e Bruno", telefone: "(11) 96666-5566", grupo: "Faculdade", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
  { nome: "Marta Ribeiro", telefone: "(11) 95555-7788", grupo: "Família do noivo", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "14/08/2026" },
  { nome: "Juliana Prima", telefone: "(11) 94444-9900", grupo: "Família da noiva", status: "confirmado", lugares: 3, restricao: "Sem lactose", criancas: 1, respondido: "09/08/2026" },
  { nome: "Diego Martins", telefone: "(11) 93333-1234", grupo: "Trabalho", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
  { nome: "Larissa Gomes (não encontrada)", telefone: "(11) 92222-4321", grupo: "—", status: "aprovacao", lugares: 1, restricao: "—", criancas: 0, respondido: "15/08/2026" },
  { nome: "Paulo e Renata", telefone: "(11) 91111-8765", grupo: "Faculdade", status: "confirmado", lugares: 2, restricao: "—", criancas: 0, respondido: "08/08/2026" },
  { nome: "Beatriz Nunes", telefone: "(11) 90000-2468", grupo: "Família do noivo", status: "pendente", lugares: 0, restricao: "—", criancas: 0, respondido: "—" },
  { nome: "Carlos Eduardo", telefone: "(11) 98765-1357", grupo: "Trabalho", status: "recusado", lugares: 0, restricao: "—", criancas: 0, respondido: "11/08/2026" },
];

const STATUS_LABEL = {
  confirmado: "Confirmado",
  recusado: "Recusado",
  pendente: "Pendente",
  aprovacao: "Aguardando aprovação",
};

let currentStatusFilter = "todos";
let currentInvitePhone = "";

/** Monta o link do convite (aponta pro convite.html publicado junto do site). */
function buildInviteLink() {
  return window.location.origin + window.location.pathname.replace("painel.html", "convite.html");
}

/** Gera o texto padrão da mensagem de convite/lembrete para um convidado. */
function buildInviteMessage(guest) {
  const primeiroNome = guest.nome.split(" ")[0];
  const link = buildInviteLink();
  return `Oi ${primeiroNome}! 💌\n\nVocê está convidado(a) para o nosso casamento!\n\n📅 12 de dezembro de 2026\n📍 Sítio das Palmeiras\n\nConfirma sua presença aqui, é rapidinho (menos de 1 minuto):\n${link}\n\nCom carinho,\nAna & Marcos`;
}

/** Abre o modal de convite já com a mensagem pronta pra essa pessoa. */
function openInviteMessage(index) {
  const guest = GUESTS[index];
  currentInvitePhone = guest.telefone;
  document.getElementById("inviteModalGuestName").textContent = guest.nome;
  document.getElementById("inviteMessageText").value = buildInviteMessage(guest);
  document.getElementById("inviteModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeInviteModal() {
  document.getElementById("inviteModal").classList.remove("open");
  document.body.style.overflow = "";
}

/** Abre o WhatsApp com o número do convidado e o texto (já editado) preenchido. */
function sendViaWhatsApp() {
  const digits = currentInvitePhone.replace(/\D/g, "");
  const withCountryCode = digits.length <= 11 ? "55" + digits : digits;
  const text = encodeURIComponent(document.getElementById("inviteMessageText").value);
  window.open(`https://wa.me/${withCountryCode}?text=${text}`, "_blank");
}

/** Preenche o filtro de grupo com os grupos que existem nos dados. */
function populateGroupFilter() {
  const select = document.getElementById("groupFilter");
  const groups = [...new Set(GUESTS.map((g) => g.grupo).filter((g) => g !== "—"))];
  groups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    select.appendChild(opt);
  });
}

/** Atualiza os números dos cards de estatística no topo. */
function updateStats() {
  document.getElementById("statTotal").textContent = GUESTS.length;
  document.getElementById("statConfirmado").textContent = GUESTS.filter((g) => g.status === "confirmado").length;
  document.getElementById("statRecusado").textContent = GUESTS.filter((g) => g.status === "recusado").length;
  document.getElementById("statPendente").textContent = GUESTS.filter((g) => g.status === "pendente").length;
  document.getElementById("statAprovacao").textContent = GUESTS.filter((g) => g.status === "aprovacao").length;
}

/** Aplica busca + filtro de grupo + filtro de status e redesenha a tabela. */
function renderTable() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const group = document.getElementById("groupFilter").value;
  const tbody = document.getElementById("guestTableBody");
  const emptyState = document.getElementById("emptyState");

  const filtered = GUESTS
    .map((g, idx) => ({ ...g, idx }))
    .filter((g) => {
      const matchesStatus = currentStatusFilter === "todos" || g.status === currentStatusFilter;
      const matchesSearch = !search || g.nome.toLowerCase().includes(search) || g.telefone.includes(search);
      const matchesGroup = group === "todos" || g.grupo === group;
      return matchesStatus && matchesSearch && matchesGroup;
    });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  filtered.forEach((g) => {
    const tr = document.createElement("tr");
    const approveBtn = g.status === "aprovacao" ? '<button class="row-action">Aprovar</button>' : "";
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
      <td style="display:flex; gap:6px; flex-wrap:wrap;">
        <button class="row-action" onclick="openInviteMessage(${g.idx})">Convite</button>
        ${approveBtn}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/** Troca o filtro de status ativo (usado pelos cards e pelo botão "quem não respondeu"). */
function setStatusFilter(status) {
  currentStatusFilter = status;
  document.querySelectorAll(".stat-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.filter === status);
  });
  renderTable();
}

document.addEventListener("DOMContentLoaded", () => {
  populateGroupFilter();
  updateStats();
  setStatusFilter("todos");

  document.getElementById("searchInput").addEventListener("input", renderTable);
  document.getElementById("groupFilter").addEventListener("change", renderTable);

  document.querySelectorAll(".stat-card").forEach((card) => {
    card.addEventListener("click", () => setStatusFilter(card.dataset.filter));
  });

  document.getElementById("btnNaoRespondeu").addEventListener("click", () => setStatusFilter("pendente"));

  document.getElementById("btnLimpar").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("groupFilter").value = "todos";
    setStatusFilter("todos");
  });

  // fecha o modal de convite clicando fora do cartão
  document.getElementById("inviteModal").addEventListener("click", (e) => {
    if (e.target.id === "inviteModal") closeInviteModal();
  });
});
